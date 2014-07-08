/* global MozActivity */

define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates',
  'utils/mimetype',
  'utils/platform'
], function (Backbone, $, global, Message, templates, Mimetype, platform) {
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
      jsonModel.meta.timestamp = jsonModel.meta.date.getTime();
      var newElement = this.template(jsonModel);
      this.setElement(newElement);
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

    isAAC: function () {
      return this.model.get('contents').uri.match(/.aac$/);
    },

    _downloadMedia: function () {
      var _this = this;

      // XXX: Delegate on browser to see media on Firefox 1.1
      if (!_this.isAAC() && platform.isFFOS11()) {
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


    _mimeConversionMap: {
      'audio/aac': 'audio/mpeg'
    },

    _openWithActivity: function (blob, dontSave) {
      var extension = Mimetype.getExtension(blob.type);
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
