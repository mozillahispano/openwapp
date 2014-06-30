define([
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'views/emoji-selector',
  'templates'
], function (Backbone, $, global, Message, EmojiSelector, templates) {
  'use strict';

  return Backbone.View.extend({

    template: templates['compose-message'],

    model: Message,

    events: {
      'click #conversation-send-button' : '_createTextMessage',
      'click #insert-emoji': '_toggleEmojiList',
      'click #message-text-input': '_hideEmojiList',
      'focus #message-text-input': '_updateScrollTarget',
      'blur #message-text-input': '_updateScrollTarget'
    },

    initialize: function () {
      window.onresize = this._updateScroll.bind(this);
    },

    _updateScrollTarget: function () {
      var scrollView = $('.page-wrapper').get(0);
      this._scrollTarget = scrollView.scrollTop + scrollView.clientHeight;
    },

    _updateScroll: function () {
      var scrollView = $('.page-wrapper').get(0);
      scrollView.scrollTop = this._scrollTarget - scrollView.clientHeight;
    },

    _toggleEmojiList: function () {
      this._emojiSelector[this._emojiSelector.isHidden() ? 'show' : 'hide']();
    },

    _hideEmojiList: function () {
      this._emojiSelector.hide();
    },

    clear: function () {
      this.stopListening();
    },

    render: function () {
      var newElement = this.template(this.model.toJSON());
      this.setElement($(newElement));

      this.$messageComposer = this.$el.find('#message-text-input');

      this._emojiSelector = new EmojiSelector({
        composer: this.$messageComposer.get(0)
      });
      $('#conversation').after(this._emojiSelector.render().el);
      this._emojiSelector.changeTab('people');
    },

    _createTextMessage: function (event) {
      event.preventDefault();

      var html = this.$messageComposer.html().trim();
      if (html.length === 0) { return; }

      html = this._emojiToUnicode(html);
      var text = this._brToBreakLines(html);
      var newModel = new Message({
        type: 'text',
        contents: text,
        from: {msisdn: global.auth.get('msisdn')},
        meta: {date: new Date()}
      });

      this.$messageComposer.html('<br>');
      this._emojiSelector.clearCaretPosition();
      this.trigger('compose:message:text', newModel);
    },

    _emojiToUnicode: function (html) {
      var container = document.createElement('div');
      container.innerHTML = html;
      var emojis = container.querySelectorAll('.emoji');
      emojis = Array.prototype.slice.call(emojis);
      emojis.forEach(function _replace(emojiElement) {
        var entity = document.createTextNode(emojiElement.dataset.code);
        emojiElement.parentNode.replaceChild(entity, emojiElement);
      });
      return container.innerHTML;
    },

    _brToBreakLines: function (html) {
      var lines = html.split(/<br\/?>/g);
      lines = lines.map(function _unscape(line) {
        var d = document.createElement('div');
        d.innerHTML = line;
        return d.textContent;
      });
      return lines.join('\n');
    }
  });
});
