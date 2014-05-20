define([
  'backbone',
  'zeptojs',
  'global',
  'models/contact',
  'templates'
], function (Backbone, $, global, contactModel, templates) {
  'use strict';
  var Contacts = Backbone.View.extend({
    tagName: 'img',

    template: templates['contact-photo'],

    model: contactModel,

    photoURL: null,

    render: function () {
      this.listenTo(this.model, 'change:_photo', this._updatePicture);
      this._updatePicture();
      return this;
    },

    _updatePicture: function () {
      this._makeURL();
      this.$el.html(this.template({
        photoURL: this.photoURL
      }));
      var _this = this;

      // Revoke the URL as the image data is already loaded by the image.
      this.$el.find('img')[0].onload = function () {
        _this._clear();
      };
    },

    _makeURL: function () {
      var photo = this.model.get('photo');
      if (!photo) { return; }

      if (photo instanceof Blob) {
        this.photoURL = window.URL.createObjectURL(photo);
      }
      else {
        console.warning('The photo is not a blob.');
      }
    },

    _clear: function () {
      if (this.photoURL) {
        window.URL.revokeObjectURL(this.photoURL);
        this.photoURL = null;
      }
    }
  });

  return Contacts;
});
