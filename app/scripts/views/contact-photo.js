define([
  'backbone',
  'zeptojs',
  'global',
  'models/contact',
  'templates'
], function (Backbone, $, global, contactModel, templates) {
  'use strict';
  var Contacts = Backbone.View.extend({
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
      var newElement = this.template({
        photoURL: this.photoURL
      });
      if (this.$el) {
        this.$el.replaceWith(newElement);
      }
      this.setElement(newElement);

      // Revoke the URL as the image data is already loaded by the image.
      this.el.onload = function () {
        this._clear();
      }.bind(this);
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
