define([
  'backbone',
  'zeptojs',
  'global',
  'models/conversation',
  'views/contact-photo',
  'templates',
  'templates/helpers'
], function (Backbone, $, global, Conversation, ContactPhoto, templates,
             helpers) {
  'use strict';

  return Backbone.View.extend({

    template: templates['mini-conversation'],

    model: Conversation,

    el: 'li',

    events: {
      'click li > a' : '_openConversation'
    },

    initialize: function () {
      this.contactPhotoURL = null;
      this.listenTo(this.model, 'change', this._refreshRender);
      var messages = this.model.get('messages');
      if (messages) {
        this.listenTo(messages, 'add', this._refreshRender);
      }
    },

    clear: function () {
      if (this.contactPhotoURL) {
        window.URL.revokeObjectURL(this.contactPhotoURL);
      }
    },

    render: function () {
      var json = this.model.toJSON();

      // Make last message always the latest if there are messages,
      // else use whatever is there (e.g. what was recovered from storage)
      var messages = this.model.get('messages');
      if (messages && messages.size()) {
        var last = messages.at(messages.size() - 1);
        json.lastMessage = last.getSummary();
        json.date = this.model.get('date');
      }

      var newElement = this.template(json);
      this.setElement(newElement);

      var contact = this.model.get('contact');
      if (contact) {
        this.contactPhoto = new ContactPhoto({ model: contact });
        this.$el.find('.avatar').append(this.contactPhoto.render().el);
      }
      helpers.revealEmoji(this.$el.find('dd.name'));
      helpers.revealEmoji(this.$el.find('dd.event'));
    },

    // re-render in current element
    _refreshRender: function () {
      if (this.$el) {
        var oldElement = this.$el;
        this.render();
        oldElement.replaceWith(this.$el);
      }
    },

    _openConversation: function (event) {
      event.preventDefault();
      global.router.navigate('conversation/' + this.model.get('id'),
        {trigger: true});
    }
  });

});
