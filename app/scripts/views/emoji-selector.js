define([
  'backbone',
  'handlebars',
  'zeptojs',
  'global',
  'templates'
], function (Backbone, Handlebars, $, global, templates) {
  'use strict';

  var EmojiSelector = Backbone.View.extend({

    template: templates['emoji-selector'],

    events: {
      'click ul.categories button': '_onTabClick',
      'click ul.content': '_selectEmoji'
    },

    initialize: function (options) {
      this._composer = options.composer;
      $(this._composer).on('keyup', this._changeCaret.bind(this));
      $(this._composer).on('mouseup', this._changeCaret.bind(this));
      $(this._composer).on('keypress', this._controlComposition.bind(this));
      this.clearCaretPosition();
    },

    render: function () {
      this.setElement(this.template());
      return this;
    },

    _onTabClick: function (evt) {
      evt.preventDefault();
      var category = evt.target.dataset.category;
      if (!category) {
        return;
      }
      this.changeTab(category);
    },

    show: function () {
      this.el.previousSibling.classList.add('selecting-emoji');
      this.el.classList.remove('hidden');
      this.el.focus();
    },

    hide: function () {
      this.el.previousSibling.classList.remove('selecting-emoji');
      this.el.classList.add('hidden');
    },

    isHidden: function () {
      return this.el.classList.contains('hidden');
    },

    changeTab: function (category) {
      $('.emoji-category').hide();
      $('.emoji-category.category-' + category).show();
    },

    _changeCaret: function () {
      this._updateCaretPosition(window.getSelection().getRangeAt(0));
    },

    clearCaretPosition: function () {
      this._currentContainer = this._composer;
      this._currentOffset = 0;
    },

    _selectEmoji: function (event) {
      var selectedEmoji = $(event.target).closest('li').find('span');
      if (selectedEmoji.length === 0) { return; }

      var newEmoji = selectedEmoji.get(0).cloneNode(true);
      newEmoji.setAttribute('contenteditable', 'false');
      newEmoji.addEventListener('click', function _setCaret(emoji, evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var range = window.getSelection().getRangeAt(0);
        range.setEndAfter(emoji);
        range.collapse(false);
        this._updateCaretPosition(range);
      }.bind(this, newEmoji));
      var range = document.createRange();

      range.selectNodeContents(this._composer);
      range.setEnd(this._currentContainer, this._currentOffset);
      range.collapse(false);
      range.insertNode(newEmoji);
      range.setEndAfter(newEmoji);
      this._updateCaretPosition(range);
    },

    _controlComposition: function (evt) {
      if (evt.keyCode === 8) {
        var range = window.getSelection().getRangeAt(0);
        var previousNode, currentNode = range.endContainer;

        // Look for the previous node
        // If we are not inside a text node.
        if (currentNode === this._composer && range.endOffset > 0) {
          previousNode = this._composer.childNodes[range.endOffset - 1];
        }
        // If we are inside a text node (at the beginning)
        else if (currentNode.nodeType === Node.TEXT_NODE &&
                 range.endOffset === 0) {
          previousNode = currentNode.previousSibling;
        }
        // Ignore empty text nodes
        while (previousNode && previousNode.nodeType === Node.TEXT_NODE &&
               previousNode.data.length === 0) {
          previousNode = previousNode.previousSibling;
        }

        var isAfterEmoji = previousNode && previousNode.nodeName === 'SPAN';

        if (isAfterEmoji) {
          evt.preventDefault();
          previousNode.parentNode.removeChild(previousNode);
        }
      }
    },

    _updateCaretPosition: function (range) {
      this._currentContainer = range.endContainer;
      this._currentOffset = range.endOffset;
    }
  });

  return EmojiSelector;
});
