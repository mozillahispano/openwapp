define([
  'handlebars',
  'global',
  'emoji'
], function (Handlebars, global, emoji) {
  'use strict';

  // returns a string with the formatted day of the date provided. It also
  // fuzzifies today and yesterday.
  // Examples for returned values:
  //  - 'today'
  //  - 'yesterday'
  //  - '12 Mar'
  function formatDay(date) {
    if (!date) { return ''; }

    var now = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var day = null;

    if (now.toDateString() === date.toDateString()) {
      day = Helpers._translate('today');
    }
    else if (yesterday.toDateString() === date.toDateString()) {
      day = Helpers._translate('yesterday');
    }
    else {
      var months = [Helpers._translate('jan'),
                    Helpers._translate('feb'),
                    Helpers._translate('mar'),
                    Helpers._translate('apr'),
                    Helpers._translate('may'),
                    Helpers._translate('jun'),
                    Helpers._translate('jul'),
                    Helpers._translate('aug'),
                    Helpers._translate('sep'),
                    Helpers._translate('oct'),
                    Helpers._translate('nov'),
                    Helpers._translate('dic')];
      day = date.getDate() + ' ' + months[date.getMonth()];
    }

    return day;
  }

  var Helpers = {
    // returns a CSS class name for the owner of a message, depending on a
    // MSISDN.
    // returned values can be either 'me' or 'other'
    _messageOwnerClass: function (msisdn) {
      return global.auth.get('msisdn') === msisdn ? 'me' : 'other';
    },

    // returns a formatted date to show on messages in a conversation
    // returned examples: '12:01 Today', '06:34 Yesterday' or '21:30 12 Mar'
    _formattedMessageDate: function (messageDate) {
      if (!messageDate) { return ''; }
      var formattedDate = formatDay(messageDate);
      var formattedTime = /^\d\d:\d\d/.exec(messageDate.toTimeString());
      var currentYear = new Date().getFullYear();
      var formattedYear = currentYear !== messageDate.getFullYear() ?
                          ' ' + messageDate.getFullYear() : '';
      return formattedTime + ' ' + formattedDate + formattedYear;
    },

    _ifIsUnsent: function (status, block) {
      return (status === 'unsent') ? block.fn(this) : block.inverse(this);
    },

    _ifIsSent: function (status, block) {
      return (status === 'sent') ? block.fn(this) : block.inverse(this);
    },

    _ifIsReceived: function (status, block) {
      return (status === 'received') ? block.fn(this) : block.inverse(this);
    },

    _ifNotIsMine: function (msisdn, block) {
      return global.auth.get('msisdn') !== msisdn ?
             block.fn(this) : block.inverse(this);
    },

    _translate: function (id) {
      return navigator.mozL10n.get([id]);
    },

    _currentCommit: function () {
      return '{{currentCommit}}';
    },

    revealEmoji: function () {
      for (var i = 0, l = arguments.length; i < l; i++) {
        this._transformIntoEmoji(arguments[i]);
      }
    },

    _transformIntoEmoji: function ($el) {
      var html = $el.html().trim().replace(/\n/g, '<br/>');
      html = emoji.softbankToUnified(html);
//      html = emoji.googleToUnified(html);
//      html = emoji.docomoToUnified(html);
//      html = emoji.kddiToUnified(html);
      $el.html(emoji.unifiedToHTML(html));
    },

    _protocol:
      /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,

    _scheme: /(^|[^\/])(www\.[\S]+(\b|$))/gim,

    _expand: function (text) {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(
        Helpers._protocol,
        '<a href="$1" target="_blank">$1</a>'
      );
      text = text.replace(
        Helpers._scheme,
        '$1<a href="http://$2" target="_blank">$2</a>'
      );
      return new Handlebars.SafeString(text);
    },

    register: function () {
      Handlebars.registerHelper('messageOwnerClass', this._messageOwnerClass);
      Handlebars.registerHelper('formattedMessageDate',
        this._formattedMessageDate);
      Handlebars.registerHelper('ifIsUnsent', this._ifIsUnsent);
      Handlebars.registerHelper('ifIsReceived', this._ifIsReceived);
      Handlebars.registerHelper('ifIsSent', this._ifIsSent);
      Handlebars.registerHelper('translate', this._translate);
      Handlebars.registerHelper('ifNotIsMine', this._ifNotIsMine);
      Handlebars.registerHelper('currentCommit', this._currentCommit);
      Handlebars.registerHelper('expand', this._expand);
    }
  };

  return Helpers;
});
