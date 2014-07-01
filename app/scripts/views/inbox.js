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
      'click #add-contact': '_pickContact',
      'contextmenu #conversations ul': '_showContextMenu',
      'click #new-group': '_newGroup'
    },

    initialize: function () {
      if (!global.client.isOnline) {
        var onSuccess = function () {
          this.stopListening(global.auth, 'login:fail', onFail);
          this.stopListening(global.auth, 'login:expired', onExpired);
        };

        var onFail = function () {
          this.stopListening(global.auth, 'login:success', onSuccess);
          this.stopListening(global.auth, 'login:expired', onExpired);
          if (localStorage.getItem('isPinSent')) {
            this._goToValidate();
          }
          else {
            this._goToLogin();
          }
        };

        var onExpired = function () {
          this.stopListening(global.auth, 'login:fail', onFail);
          this.stopListening(global.auth, 'login:success', onSuccess);
          var wantToPurchase =
            confirm('Your account has expired. Do you want to update your account?');
          if (wantToPurchase) {
            window.open(this._getUpgradeURL(), '', 'dialog');
          }
        };

        this.listenToOnce(global.auth, 'login:success', onSuccess);
        this.listenToOnce(global.auth, 'login:fail', onFail);
        this.listenToOnce(global.auth, 'login:expired', onExpired);

        global.auth.checkCredentials();
      }
      this._contactListBuffer = document.createDocumentFragment();
    },

    _getUpgradeURL: function () {
      return global.client.getUpgradeAccountURL(global.auth.get('msisdn'));
    },

    _newGroup: function (evt) {
      if (evt) { evt.preventDefault(); }
      var groups = global.contacts.getGroups();
      if (groups && groups.length >= 50) {
        var l10n = global.localisation[global.language];
        var stringId = 'participatingInTooMuchGroups';
        window.alert(l10n[stringId]);
      } else {
        console.log('Limit not reached, allowing creating a new group');
        global.router.navigate('new-group', { trigger: true });
      }
    },

    _showContextMenu: function (evt) {
      if (evt) { evt.preventDefault(); }

      var interpolate = global.l10nUtils.interpolate;
      var l10n = global.localisation[global.language];

      var listitem = $(evt.target).closest('li')[0];
      var conversationId = listitem.dataset.conversationId;
      var title = listitem.dataset.conversationName;
      var isGroup = listitem.dataset.isGroup || false;

      var stringId, message;
      if (isGroup) {
        stringId = 'removeGroupConversation';
        message = interpolate(l10n[stringId], {
          groupTitle: title
        });
      } else {
        stringId = 'remove1to1Conversation';
        message = interpolate(l10n[stringId], {
          who: title
        });
      }

      if (window.confirm(message)) {
        if (isGroup) {
          global.client.leaveGroup(conversationId);
        }
        global.historyCollection.removeConversation(conversationId);
        listitem.parentNode.removeChild(listitem);
      }
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

    _showCentinel: function () {
      $(this._centinel).show();
    },

    _hideCentinel: function () {
      $(this._centinel).hide();
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

      // Display the centinel and process the buffer
      if (this._centinel) {
        this._showCentinel();
        if (this._checkCentinelVisibility()) {
          this._consumeBuffer();
        }
      }
    },

    _consumeBuffer: function () {
      var list = this.$el.find('#conversations ul').first();
      list.append(this._contactListBuffer);
      if (global.historyCollection.finishedSyncing) {
        this._hideCentinel();
      }
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

      if (this.model.finishedSyncing) {
        this._hideCentinel();
      }
      else {
        this.listenToOnce(this.model, 'history:synced', function () {
          this._hideCentinel();
          if (this.model.models.length === 0) {
            this.$el.find('#no-conversations').show();
          }
        });
      }
      // Ask for rating when everything is settled
      this.ratePromptTimeout = window.setTimeout(function () {
        window.fxosRate.promptRequired();
      }, 2000);
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
      window.clearTimeout(this.ratePromptTimeout);
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
