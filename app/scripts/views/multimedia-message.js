/* global MozActivity */

define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates'
], function (Backbone, $, global, Message, templates) {
  'use strict';

  return Backbone.View.extend({

    template: templates['multimedia-message'],

    model: Message,

    events: {
      'click .resend':    '_requestResend',
      'click a.received': '_openMedia'
    },

    initialize: function () {
      this.listenTo(this.model, 'change:status', this._changeStatus);
    },

    clear: function () {
      this.stopListening();
    },

    render: function () {
      var jsonModel = this.model.toJSON();
      if (jsonModel.from.authorMsisdn) {
        jsonModel.author =
          global.contacts.getParticipantName(jsonModel.from.authorMsisdn);
      }
      else {
        jsonModel.author = jsonModel.from.displayName;
      }
      var newElement = this.template(jsonModel);
      this.setElement(newElement);

      var img = this.$el.find('aside img');
      img.css('visibility', 'hidden');

      var _this = this;
      img.on('load', function () {
        _this._cropImage();
        img.css('visibility', 'visible');
      });
    },

    _cropImage: function () {
      var containerWidth = this.$el.find('aside a').width();
      var containerHeight = this.$el.find('aside a').height();
      var img = this.$el.find('aside img');

      var thumbWidth = containerWidth;
      var thumbHeight = containerHeight;
      var ratio = img.width() / img.height();
      if (ratio >= 1) { // landscape
        thumbWidth = thumbHeight * ratio;
      }
      else { // portrait
        thumbHeight = thumbWidth / ratio;
      }

      img.width(thumbWidth);
      img.height(thumbHeight);
      img.css({
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'margin-left': -thumbWidth / 2 + 'px',
        'margin-top': -thumbHeight / 2 + 'px'
      });
    },

    _requestResend: function () {
      console.log('Request to send message', this.model.get('contents'));
      this.trigger('message:resend', this.model);
    },

    _changeStatus: function () {
      var oldElement = this.$el;
      this.render();
      oldElement.replaceWith(this.$el);
    },

    _openMedia: function (evt) {
      var _this = this;
      var systemFilename = this.model.get('contents').systemFilename;

      if (systemFilename) {
        global.sdManager.load(systemFilename, function (err, blob) {
          if (err) {
            return _this._downloadMedia();
          }
          _this._openWithActivity(blob, !!'dontSave');
        });
      }
      else {
        this._downloadMedia();
      }

      if (evt) { evt.preventDefault(); }
      return false;
    },

    isFFOX11: function () {
      return (typeof navigator.mozTCPSocket.listen) !== 'function';
    },

    isAAC: function () {
      return this.model.get('contents').uri.match(/.aac$/);
    },

    _downloadMedia: function () {
      var _this = this;

      // XXX: Delegate on browser to see media on Firefox 1.1
      if (!_this.isAAC() && _this.isFFOX11()) {
        new MozActivity({
          name: 'view',
          data: { type: 'url', url: this.model.get('contents').uri }
        });
        return;
      }

      global.client.download(
        this.model.get('contents').uri,
        function (err, type, data) {
          if (err) {
            onNetworkError(err);
          }

          if (type === 'complete') {
            _this._openWithActivity(data.blob);
          }
        }
      );

      function onNetworkError() {
        console.log('network error while downloading content...');
        window.alert(global.localisation[global.language].loadImageError);
      }
    },

    // XXX: Use this source:
    // https://github.com/mozilla-b2g/gaia/blob/master/shared/js/mime_mapper.js
    _extensionByMimeType: {
      // Image
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      // Audio
      'audio/aac': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/3gpp': '3gp',
      'audio/amr': 'amr',
      // Video
      'video/mp4': 'mp4',
      'video/mpeg': 'mpg',
      'video/ogg': 'ogg',
      'video/webm': 'webm',
      'video/3gpp': '3gp',
      // Application
      // If we want to support some types, like pdf, just add
      // 'application/pdf': 'pdf'
      'application/vcard': 'vcf',
      // Text
      'text/vcard': 'vcf',
      'text/x-vcard': 'vcf'
    },

    _mimeConversionMap: {
      'audio/aac': 'audio/mpeg'
    },

    _openWithActivity: function (blob, dontSave) {
      var extension = this._extensionByMimeType[blob.type];
      blob = this._preprocessBlob(blob);

      var _this = this;
      var fileName = Date.now() + '.' + extension;
      var activity = new window.MozActivity({
        name: 'open',
        data: {
          filename: dontSave ? undefined : global.sdManager.getPath(fileName),
          type: blob.type,
          blob: blob,
          allowSave: !dontSave
        }
      });
      activity.onsuccess = function () {
        var fileName = activity.result.saved;
        if (fileName) {
          var contents = _this.model.get('contents');
          contents.systemFilename = fileName;
          _this.model.set('contents', contents);
          _this.model.saveToStorage();
        }
      };
    },

    _preprocessBlob: function (blob) {
      var targetMimeType = this._mimeConversionMap[blob.type];
      if (!targetMimeType) {
        return blob;
      }

      blob = new Blob([blob], { type: targetMimeType });
      return blob;
    }
  });
});
