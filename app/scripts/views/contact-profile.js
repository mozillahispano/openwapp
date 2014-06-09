define([
  'backbone',
  'zeptojs',
  'global',
  'templates',
  'models/contact',
  'templates/helpers'
], function (Backbone, $, global, templates, Contact, helpers) {
  'use strict';

  var MozActivity = window.MozActivity;

  var Profile = Backbone.View.extend({

    currentParticipants: [],

    el: '#main-page',

    model: Contact,

    events: {
      'click .dial':        '_dialContact',
      'click .send-sms':    '_smsContact',
      'click button.close': 'close',
      'click #profile-picture': '_openProfilePicture'
    },

    template: templates['contact-profile'],

    render: function () {
      var internationalPhone = this.model.get('phone');
      this.$el.html(this.template({
        displayName: this.model.get('displayName') || '+' + internationalPhone,
        state: this.model.get('state'),
        phone: internationalPhone
      }));
      this._replacePhoto(this.model.get('photo'));
      helpers.revealEmoji(this.$el.find('#state'));
    },

    _openProfilePicture: function (evt) {
      if (evt) { evt.preventDefault(); }

      var blob = this.model.get('photo');
      if (blob instanceof window.Blob) {
        var extension = this._extensionByMimeType[blob.type];
        var fileName = this.model.get('displayName') + '.' + extension;
        new window.MozActivity({
          name: 'open',
          data: {
            filename: global.sdManager.getPath(fileName),
            type: blob.type,
            blob: blob,
            allowSave: true
          }
        });
      }
      return false;
    },

    // XXX: Use this source:
    // https://github.com/mozilla-b2g/gaia/blob/master/shared/js/mime_mapper.js
    _extensionByMimeType: {
      // Image
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/bmp': 'bmp'
    },

    _dialContact: function () {
      new MozActivity({
        name: 'dial',
        data: {
          type: 'webtelephony/number',
          number: '+' + this.model.get('phone')
        }
      });
    },

    _smsContact: function () {
      new MozActivity({
        name: 'new',
        data: {
          type: 'websms/sms',
          number: '+' + this.model.get('phone')
        }
      });
    },

    _replacePhoto: function (source) {
      if (!source) { return; }

      this.clear();
      if (source instanceof window.Blob) {
        this.$el.find('img').attr('src', window.URL.createObjectURL(source));
      }
      else {
        console.warn('The photo is not a blob.');
      }
    },

    close: function (evt) {
      if (evt) { evt.preventDefault(); }
      var previous =  'conversation/' + this.model.get('id');
      global.router.navigate(previous, { trigger: true });
    },

    clear: function () {
      window.URL.revokeObjectURL(this.$el.find('img').attr('src'));
    }
  });

  return Profile;
});
