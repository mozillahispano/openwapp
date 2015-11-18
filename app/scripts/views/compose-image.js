/* global MozActivity */
/* global URL */
define([
  'underscore',
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates',
  'utils/thumbnail',
  'vendor/canvasToBlob/canvas-toBlob.min'
], function (_, Backbone, $, global, Message, templates, Thumbnail) {
  'use strict';

  return Backbone.View.extend({

    el: '#main-page',

    template: templates['compose-image'],

    model: Message,

    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10M

    events: {
      'click button.submit': 'submitMultiMedia'
    },

    initialize: function (options) {
      this.conversation = options.conversation;
      console.log('creating image message in conv: ' +
        this.conversation.get('id'));
    },

    clear: function () {
      this.stopListening();
      if (this.dataUri) { window.URL.revokeObjectURL(this.dataUri); }
    },

    render: function () {
      var data = _.extend(this.model.toJSON(), {
        conversationTitle: this.conversation.get('title'),
        conversationId: this.conversation.id
      });
      this.$el.html(this.template(data));
      this.pickMultiMedia();
    },

    pickMultiMedia: function () {
      var _this = this;
      var activity = new MozActivity({
        name: 'pick',
        data: {
          type: ['image/jpeg', 'video/*', 'audio/*']
        }
      });

      activity.onsuccess = function () {
        console.log('**init pickMultimedia activity.onsuccess convID: ' +
          _this.conversation.get('id'));

        var blob = activity.result.blob;
        if (blob.size > _this.MAX_FILE_SIZE) {
          window.alert(navigator.mozL10n.get('fileTooLargeToBeSent'));
          global.router.navigate('conversation/' + _this.conversation.get('id'),
          { trigger: true });
          return;
        }

        var type = blob.type.split('/')[0];

        // For images, allow preview and send
        if (type === 'image') {
          _this.resizeBlob(blob, global.maxImageWidth, global.maxImageHeight,
            function (resized) {
              _this._setContent(resized, activity.result.name);
              _this.renderImage();
            });
        }

        // For the rest of the media, send directly
        else {
          _this._setContent(blob, activity.result.name);
          _this.submitMultiMedia();
        }
      };

      activity.onerror = function () {
        console.log('error picking image: ' + this.error);
        global.router.navigate('conversation/' + _this.conversation.get('id'),
        { trigger: true });
      };
    },

    _setContent: function (blob, name) {
      var contents = {
        caption: name || null,
        blob: blob,
        thumbSrc: null
      };

      var type = blob.type.split('/')[0];
      this.model.set('type', type);
      this.model.set('contents', contents);
      this.model.set('from', {msisdn: global.auth.get('msisdn')});
      this.model.set('meta', new Date());
    },

    resizeBlob: function (blob, maxWidth, maxHeight, callback) {
      var img = new Image();
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var canvasCopy = document.createElement('canvas');
      var copyContext = canvasCopy.getContext('2d');

      var url = URL.createObjectURL(blob);
      img.src = url;
      img.onload = function () {
        var ratio = 1;

        if (img.width > maxWidth) {
          ratio = maxWidth / img.width;
        }
        else if (img.height > maxHeight) {
          ratio = maxHeight / img.height;
        }

        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height,
                        0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(callback, 'image/jpeg');
      };
    },

    renderImage: function () {
      this.dataUri = window.URL.createObjectURL(
          this.model.get('contents').blob);

      var image = $('<img>').attr({
        src: this.dataUri
      });

      // width - 38 (padding left and right)
      var maxWidth = this.$el.find('.page-wrapper').width() - 38;
      var maxHeight = this.$el.find('.page-wrapper').height();
      image.css({
        'max-width': maxWidth + 'px',
        'max-height': maxHeight + 'px'
      });

      this.$el.find('.viewer').append(image);
      this.$el.find('.viewer').height(maxHeight).width(maxWidth).show();
      this.$el.find('.loading').hide();

      console.log('render img in ' + this.conversation.get('id'));
    },

    submitMultiMedia: function () {
      var destination = this.conversation.get('id');
      console.log('sending multimedia to ' + destination);

      if (global.router.currentView.conversation === this.conversation) {
        this.$el.find('.loading').show();
        this.$el.find('form#conversation-compose-image').hide();
        this.$el.find('.viewer').hide();

        var contents = this.model.get('contents');
        if (this.$el.find('form > #image-caption').val()) {
          contents.caption = this.$el.find('form > #image-caption').val();
        } else {
          contents.caption = global
            .localisation[global.language].defaultImageCaption;
        }

        this.model.set('meta', {date: new Date()});
        this.model.set('contents', contents);

        var _this = this;
        this._getThumbnailSrc(function (source) {
          contents.thumbSrc = source;
          _this.model.set('contents', contents);
          _this.conversation.get('messages').push(_this.model);

          if (global.rtc.get('status') === 'online') {
            _this._uploadImage(destination, contents);
          } else {
            // No connection => show message as no sent
            _this.$el.find('progress.pack-activity').addClass('hidden');
            _this._handleSentMessage(_this.model, 408, null);
          }
        });

        console.log('redirecting to conv: ' + destination);
        global.router.navigate('conversation/' + destination,
          { trigger: true });
      }
    },

    _getThumbnailSrc: function (callback) {
      var src = ''; // TODO: Add a default placeholder for multimedia
      var type = this.model.get('type');
      var blob = this.model.get('contents').blob;

      function progress() {
        if (callback) {
          callback.apply(undefined, arguments);
        }
      }

      if (type === 'image') {
        Thumbnail.generate(blob, function (error, base64) {
          if (!error) { src = 'data:image/jpeg;base64,' + base64; }
          progress(src);
        });
      }

      else if (type === 'audio') {
        src = '/images/audio_file.png';
        progress(src);

      } else if (type === 'video') {
        var video = document.createElement('video');
        var canvas = document.createElement('canvas');
        video.setAttribute('autoplay', 'autoplay');
        video.onloadeddata = function () {
          video.pause();
          canvas.width = 100;
          canvas.height = 100;
          canvas.getContext('2d')
            .drawImage(video, 0, 0, canvas.width, canvas.height);
          src = canvas.toDataURL('image/jpeg', 0.7);
          progress(src);
        };
        video.src = URL.createObjectURL(blob);
      }
    },

    _uploadImage: function (destination, contents) {
      var _this = this;
      global.client.upload(contents.blob, 'image', destination,
        function (err, type, result) {
          if (err) {
            return onError(err);
          }

          switch (type) {
          case 'complete':
            onComplete(result.location);
            break;
          case 'progress':
            onProgresss(result.progress);
            break;
          }
        }
      );

      function onComplete(location) {
        contents.uri = location;
        _this.model.set('contents', contents);
        _this._sendImage();
      }

      function onProgresss(progress) {
        if (global.router.currentView.model === _this.conversation) {
          global.router.currentView.setProgressIndicator(progress);
        }
      }

      function onError(error) {
        _this._handleSentMessage(_this.model, error, null);
      }
    },

    _sendImage: function () {
      var _this = this;
      var contents = this.model.get('contents');
      global.rtc.sendImage(
      {
        type: this.model.get('type'),
        to: _this.conversation.get('id'),
        id: _this.conversation.cid,
        caption: contents.caption,
        storageUrl: contents.uri,
        contentId: contents.uri,
        blobSize: contents.blob.size,
        thumbnail: contents.thumbSrc.replace('data:image/jpeg;base64,', '')
      },
      function (error, commId) {
        if (global.router.currentView.model === _this.conversation) {
          global.router.currentView.setProgressIndicator(100);
        }
        _this._handleSentMessage(_this.model, error, commId);
      });
    },

    _handleSentMessage: function (message, error, commId) {
      if (error) { // error sending message
        // disable progress bar
        global.router.currentView.setProgressIndicator(100);
        message.set('status', 'unsent');
      }
      else { // message was sent successfully
        var meta = message.get('meta') || {};
        meta.commId = commId;
        message.set({
          status: 'sent',
          meta: meta
        });
      }

      message.saveToStorage();

      // Clean model and conversation after finishing to prevent sending
      // duplicated images resendMessage cannot clean the view so we must do it
      // at the end
      this.model = null;
      this.conversation = null;
    }
  });
});
