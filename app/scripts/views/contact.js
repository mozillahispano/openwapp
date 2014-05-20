define([
  'underscore',
  'backbone',
  'zeptojs',
  'global',
  'models/contact',
  'views/contact-photo',
  'templates',
  'templates/helpers'
], function (_, Backbone, $, global, contactModel, ContactPhoto, templates,
             helpers) {
  'use strict';

  var Contacts = Backbone.View.extend({
    tagName: 'li',

    template: templates.contact,

    model: contactModel,

    contactPhoto: null,

    initialize: function () {
      this.listenTo(this.model, 'change:state', this.render);
      this.listenTo(this.model, 'change:displayName', this.render);
      this.listenTo(this.model, 'change:subject', this.render);
      this.listenTo(this.model, 'change:_photo', this.render);
      this.showControls = !!this.options.showControls;
    },

    render: function () {
      // link this contact to a conversation with it, if phone number, inbox
      // if no phone numbers are defined
      var phone = this.model.get('phone');
      var convURI = phone ? 'conversation/' + phone : 'inbox';
      var data = _.extend(this.model.toJSON(), {
        conversationUri: convURI,
        showControls: this.showControls
      });
      this.$el.html(this.template(data));

      if (this.model.get('isGroup')) {
        this.$el.addClass('group');
      }

      if (!this.contactPhoto) {
        this.contactPhoto = new ContactPhoto({ model: this.model });
      }

      this.$el.find('aside').append(this.contactPhoto.render().el);
      helpers.revealEmoji(this.$el.find('dd.state'));

      return this;
    },

    clear: function () {}
  });

  return Contacts;
});
