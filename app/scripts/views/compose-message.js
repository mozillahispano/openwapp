define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates'
], function (Backbone, $, global, Message, templates) {
  'use strict';

  return Backbone.View.extend({

    template: templates['compose-message'],

    model: Message,

    events: {
      'click #conversation-send-button' : '_createTextMessage',
      'click #insert-emoji': '_showEmojiList'
    },

    initialize: function () {
    },

    //TODO: Move emoji functionallity to its own view
    _showEmojiList: function () {
      $('#emoji-list').removeClass('hidden');
    },

    clear: function () {
      this.stopListening();
    },

    render: function () {
      var newElement = this.template(this.model.toJSON());
      this.setElement($(newElement));
    },

    _createTextMessage: function (event) {
      event.preventDefault();

      var input = this.$el.find('#message-text-input')[0];
      var html = input.innerHTML;
      html = html.trim();
      if (html.length === 0) { return; }
      var lines = html.split(/<br\/?>/g);
      lines = lines.map(function _unscape(line) {
        var d = document.createElement('div');
        d.innerHTML = line;
        return d.textContent;
      });
      var text = lines.join('\n');

      var newModel = new Message({
        type: 'text',
        contents: text,
        from: {msisdn: global.auth.get('msisdn')},
        meta: {date: new Date()}
      });

      input.innerHTML = '';
      this.trigger('compose:message:text', newModel);
    },

    createEmojiMessage: function () {
      var $emojiItem = $('#emoji-list input:checked');
      var emojiCode = $emojiItem.val();
      var newModel = new Message({
        type: 'text',
        contents: emojiCode,
        from: {msisdn: global.auth.get('msisdn')},
        meta: {date: new Date()}
      });
      this.trigger('compose:message:text', newModel);
    }

  });
});
