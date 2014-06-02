define([
  'backbone',
  'zeptojs',
  'global',
  'collections/history',
  'models/conversation',
  'models/contact',
  'views/mini-conversation',
  'templates',
  'utils/contact-picker',
  'templates/helpers'
], function (Backbone, $, global, HistoryCollection, ConversationModel,
             Contact, MiniConversationView, templates, pickContact, Helpers) {
  'use strict';

  var localStorage = window.localStorage;

  var Inbox = Backbone.View.extend({

    el: '#main-page',

    template: templates.inbox,

    model: HistoryCollection,

    events: {
      'click #add-contact': '_pickContact'
    },

    initialize: function () {
      if (!global.client.isOnline) {
        var onSuccess = function () {
          this.stopListening(global.auth, 'login:fail', onFail);
        };

        var onFail = function () {
          this.stopListening(global.auth, 'login:success', onSuccess);
          if (localStorage.getItem('isPinSent')) {
            this._goToValidate();
          }
          else {
            this._goToLogin();
          }
        };

        this.listenToOnce(global.auth, 'login:success', onSuccess);
        this.listenToOnce(global.auth, 'login:fail', onFail);

        global.auth.checkCredentials();
      }
      this._contactListBuffer = document.createDocumentFragment();
    },

    _checkCentinelVisibility: function () {
      var view = this.$el.find('.page-wrapper')[0];
      var viewTop = view.offsetTop + view.scrollTop;
      var viewBottom = viewTop + view.clientHeight;
      var centinelTop = this._centinel.offsetTop;
      var centinelBottom = centinelTop + this._centinel.offsetHeight;
      var isVisible = viewTop < centinelBottom && centinelBottom <= viewBottom;
      if (!this._centinelWasVisible && isVisible) {
        this.trigger('centinel:appeared');
      }
      else if (this._centinelWasVisible && !isVisible) {
        this.trigger('centinel:dissapeared');
      }
      this._centinelWasVisible = isVisible;
      return isVisible;
    },

    _goToValidate: function () {
      global.router.navigate(
        'validate/' + localStorage.getItem('phoneAndCC'), { trigger: true });
    },

    _goToLogin: function () {
      global.router.navigate('login', { trigger: true });
    },

    // name = #inbox-today, #inbox-yesterday, #inbox-before
    _clearMiniConversations: function () {
      var _this = this;
      if (!this.miniConversationViews) {
        this.miniConversationViews = [];
      }
      this.miniConversationViews.forEach(function (miniC) {
        miniC.remove();
        miniC.clear();
        miniC.stopListening();
        _this.stopListening(miniC.model, 'change:date');
      });
    },

    _populate: function () {
      this._clearMiniConversations();
      this.model.sort();
      var conversations = this.model.models;
      var section = this.$el.find('#conversations').first();
      var list = section.find('ul').first();
      if (conversations.length !== 0) {
        this.$el.find('#no-conversations').hide();
        section.show();
      }

      for (var i = 0; i < conversations.length; i++) {
        var mc = new MiniConversationView({
          el: $('<li>'),
          model: conversations[i]
        });
        mc.render();

        this.listenTo(
          conversations[i],
          'message:added',
          this._onMessagePromoteConversation.bind(this, mc)
        );

        list.append(mc.$el);
        this.miniConversationViews.push(mc);
      }
    },

    _addConversation: function (c) {
      var mc = new MiniConversationView({
        el: $('<li>'),
        model: c
      });
      mc.render();

      this.listenTo(
        c,
        'message:added',
        this._onMessagePromoteConversation.bind(this, mc)
      );

      this.miniConversationViews.push(mc);
      this.$el.find('#no-conversations').hide();

      this._contactListBuffer.appendChild(mc.el);
      if (this._checkCentinelVisibility()) {
        this._consumeBuffer();
      }
    },

    _consumeBuffer: function () {
      var list = this.$el.find('#conversations ul').first();
      list.append(this._contactListBuffer);
    },

    _onMessagePromoteConversation: function (miniConversation) {
      var list = this.$el.find('#conversations ul').first();
      list.prepend(miniConversation.el);
    },

    _renderStatus: function () {
      var status = global.rtc.get('status');

      if (status) {
        this.$el.find('#presence').removeClass().addClass(status)
          .html(this._translateStatus(status));
      }
    },

    render: function () {
      // TODO: Cache the rendered element
      // - Record timestamp of last rendering (division between today/yesterday
      //  /etc) and re-render only if 24h have passed, or something like that..
      // - note: don't use new Date(), use setTimeout to prevent bugs due to
      // time changes, time zones, etc

      var status = global.rtc.get('status');
      status = (status) ? this._translateStatus(status) : '';

      this.$el.html(this.template({
        status: global.rtc.get('status') || '',
        statusTxt : status
      }));

      this.listenTo(global.rtc, 'change:status', this._renderStatus);

      this.$inboxContainer = this.$el.find('section.drawer').first();

      this._centinel = this.$el.find('#contacts-centinel')[0];
      this.$el.find('.page-wrapper')[0]
        .addEventListener('scroll', this._checkCentinelVisibility.bind(this));
      this.on('centinel:appeared', this._consumeBuffer);

      if (this.model.finishedLoading) {
        this._populate();
        this.listenTo(this.model, 'add', this._addConversation);
      }
      else {
        this.listenToOnce(this.model, 'history:loaded', function () {
          this._populate();
          this.listenTo(this.model, 'add', this._addConversation);
        });
        this.model.loadConversations();
      }
    },

    _pickContact: function (event) {
      var _this = this;
      event.preventDefault();

      pickContact(function (err, contact) {
        if (err && err.name === 'canceled') {
          return;
        }

        if (err === 'contact-not-confirmed') {
          return _this._addPickedContact(contact);
        }

        if (!err && contact) {
          if (contact.get('confirmed')) {
            _this._addPickedContact(contact);
          }
          else {
            _this._tellAFriend(contact.get('phone'));
          }
        } else {
          window.alert(global.localisation[global.language]
              .genericConnectionProblem);
        }
      });
    },

    _addPickedContact: function (contact) {
      global.historyCollection.findOrCreate(contact.id, null,
        function (err, result) {
          var conversation = result.conversation;
          global.router.navigate(
              'conversation/' + conversation.get('id'), { trigger: true });
        }
      );
    },

    _tellAFriend: function (number) {
      new window.MozActivity({
        name: 'new',
        data: {
          type: 'websms/sms',
          number: number,
          body: Helpers._translate('tellAFriendText')
        }
      });
    },

    clear: function () {
      this.model.updateInbox = undefined;
      this._clearMiniConversations();
    },

    _translateStatus : function (status) {
      //TODO get from properties
      status = status.toLowerCase();
      var newStatus = global.localisation[global.language].offline;
      if (status === 'online') {
        newStatus = global.localisation[global.language].online;
      } else if (status === 'offline') {
        newStatus = global.localisation[global.language].offline;
      } else if (status === 'connecting') {
        newStatus = global.localisation[global.language].connecting;
      }
      return newStatus;
    }
  });

  return Inbox;
});
