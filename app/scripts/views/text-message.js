define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates',
  'templates/helpers'
], function (Backbone, $, global, Message, templates, helpers) {
  'use strict';

  return Backbone.View.extend({

    template: templates['text-message'],

    model: Message,

    events: {
      'click .resend': '_requestResend',
      'click a': '_openInBrowser'
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

      helpers.revealEmoji(this.$el.find('span.content'));
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

    _openInBrowser: function (evt) {
      evt.preventDefault();
      new MozActivity({
        name: 'view',
        data: { type: 'url', url: evt.target.href }
      });
    }
  });
});
