define([
  'backbone',
  'global',
  'underscore',
  'vendor/async-storage/async-storage',
  'models/conversation',
  'models/message',
  'utils/phonenumber'
], function (Backbone, global, _, AsyncStorage, ConversationModel, MessageModel,
  PhoneNumber) {
  'use strict';

  return Backbone.Collection.extend({

    model: ConversationModel,

    initialize: function () {
      this.listenTo(global.rtc, 'message:text', this._onTextReceived);
      this.listenTo(global.rtc, 'message:image', this._onMultiMediaReceived);
      this.listenTo(global.rtc, 'message:audio', this._onMultiMediaReceived);
      this.listenTo(global.rtc, 'message:video', this._onMultiMediaReceived);
      this.listenTo(global.rtc, 'message:location', this._onLocationReceived);

      this.listenTo(global.rtc, 'notification', this._onNotification);
      this.listenTo(global.rtc, 'notification:group-subject',
        this._onSubjectNotification);
      this.listenTo(global.rtc, 'notification:group-participant',
        this._onParticipantNotification);
      this.listenTo(global.rtc, 'notification:group-picture',
        this._onPictureNotification);

      // Indicates that we have already loaded all messages from local storage
      this.finishedLoading = false;
    },

    unregister: function () {
      this.forEach(function (conversation) {
        conversation.unregister();
      });

      this.reset();
    },

    _formatImageMessageContent: function (content) {
      var res = _.extend({}, content);
      res.caption = content.caption ||
        global.localisation[global.language].defaultImageCaption;
      return res;
    },

    _onMultiMediaReceived: function (from, meta, content) {
      // content = { caption, uri, thumbSrc }
      // NOTE: In order to create an IMG element with the thumbnail use:
      // var img = $('<img>');
      // img.attr('src', message.thumbSrc);
      // (internally the thumbSrc is something like:
      //    data:image/png;base64,xxxxxxxxxx   i.e. it's embedded)
      // and then add it to whatever you need like $('body').append(img);
      console.log('received image from', from, meta, content);
      // TODO: refactor this in a proper 'translate' method that takes care
      // of the current language
      content = this._formatImageMessageContent(content);
      global.notifications.send(this._getNotificationTitle(from),
        content.caption);

      var message = new MessageModel({
        type: meta.type,
        contents: content,
        from: from,
        meta: meta
      });

      this._addIncomingMessage(message);
    },

    _onTextReceived: function (from, meta, inContent) {
      global.notifications.send(this._getNotificationTitle(from),
                                inContent);
      console.log('Received text from ', from, inContent, meta);

      var message = new MessageModel({
        type: 'text',
        contents: inContent,
        from: from,
        meta: meta
      });

      this._addIncomingMessage(message);
    },

    _onLocationReceived: function (from, meta, content) {
      console.log('received location from', from, meta, content);
      //TODO check if we dont have address
      console.log('address: ' + content.address);

      content.address = content.address ||
        global.localisation[global.language].defaultImageCaption;
      global.notifications.send(this._getNotificationTitle(from),
        content.address);

      var message = new MessageModel({
        type: 'location',
        contents: content,
        from: from,
        meta: meta
      });

      this._addIncomingMessage(message);
    },

    _onNotification: function (from, meta, content) {
      var message = new MessageModel({
        type: 'notification',
        contents: content,
        from: from,
        meta: meta
      });

      this._addIncomingMessage(message);
    },

    _onSubjectNotification: function (from, meta, content) {
      var contact = global.contacts.findWhere({phone: from.msisdn});
      if (contact) {
        contact.set({
          displayName: content.subject,
          subject: content.subject
        });
      }
    },

    _onParticipantNotification: function (from, meta, content) {
      content = content; // shut jslint up
      var convInstance =
        this.findAndCreateConversation(from.msisdn);
      convInstance.updateParticipantList();
    },

    _onPictureNotification: function (from, meta, content) {
      content = content; // shut jslint up
      var contact = global.contacts.findWhere({phone: from.msisdn});
      contact.updatePhoto(function () { contact.saveToStorage(); });
    },

    _addIncomingMessage: function (message) {
      // lookup (or create) ConversationModel
      var from = message.get('from');
      var convInstance =
        this.findAndCreateConversation(from.msisdn);
      var contact = global.contacts.findAndCreateContact(from.msisdn).contact;

      if (from.displayName) {
        if (!contact.get('displayName')) {
          contact.set('displayName', from.displayName);
        }
        if (!contact.get('isGroup')) {
          convInstance.set('title', contact.get('displayName'));
        }
      }

      var isRead = (!!global.router.currentView &&
                    global.router.currentView.model === convInstance);
      convInstance.set({
        isOnline: false,
        isRead: isRead
      });
      convInstance.get('messages').add(message);
    },

    saveConversationList: function (callback) {
      var list = this.models.map(function (conversation) {
        return conversation.get('id');
      });
      var _this = this;
      AsyncStorage.setItem('conversations', list, function () {
        console.log('Saved conversation list');
        _this.trigger('history:save');
        if (callback) { callback(); }
      });
    },

    loadConversations: function () {

      function waitFor(count, callback) {
        return function () {
          if (--count === 0) {
            callback();
          }
        };
      }

      if (this.finishedLoading) { // Only load on first use
        return;
      }

      var _this = this;
      AsyncStorage.getItem('conversations', function (list) {
        if (!list || !list.length) {
          _this.finishedLoading = true;
          _this.trigger('history:loaded');
          return _this._loadGroups();
        }

        var sync = waitFor(list.length, function () {
          _this.finishedLoading = true;
          _this.trigger('history:loaded');
          _this._loadGroups();
        });

        list.forEach(function (id) {
          console.log('[history] About to load conversation ', id);
          ConversationModel.loadFromStorage(id, sync);
        });
      });
    },

    _loadGroups: function () {

      // Stall until logged
      if (!global.client.isOnline) {
        this.listenToOnce(global.auth, 'login:success', this._loadGroups);
        return;
      }

      // Stall until contacts are loaded
      if (!global.contacts.isLoaded) {
        this.listenToOnce(global.contacts, 'complete', this._loadGroups);
        return;
      }

      var _this = this;
      global.client.getGroups(function (err, groups) {

        // Process each contact, chaining a callback calling itself
        // when either the contact is synchronized or a timeout passes.
        function syncPicturelessGroupsInSerie() {

          var picturelessGroup, timeout = null;

          function nextOne() {
            clearTimeout(timeout);
            setTimeout(syncPicturelessGroupsInSerie, 1000);
          }

          if (picturelessGroups.length) {
            picturelessGroup = picturelessGroups.pop();
            picturelessGroup.syncWithServer();
            picturelessGroup.once('synchronized:server', nextOne);
            timeout = setTimeout(function () {
              picturelessGroup.off('synchronized:server', nextOne);
              nextOne();
            }, 1000);
          }
        }

        function processGroups(list, offset) {
          var start = Date.now(),
              tooMuchTime,
              MAX_LOOP_TIME = 17;
          var result, conversation, group;
          for (var i = offset, l = list.length; i < l && !tooMuchTime; i++) {
            group = list[i];
            result = global.contacts
              .findAndCreateContact(group.gid, group.subject);

            if (result.isNew || !result.contact.get('photo')) {
              picturelessGroups.push(result.contact);
            }

            conversation =
              global.historyCollection
                .findAndCreateConversation(group.gid, { noSaveList: true });
            conversation.saveToStorage();

            tooMuchTime = Date.now() - start >= MAX_LOOP_TIME;
          }
          if (i < l) {
            setTimeout(processGroups, 0, list, i);
          }
          else {
            global.historyCollection.saveConversationList();
            _this.trigger('history:groups');
            syncPicturelessGroupsInSerie();
          }
        }

        groups = groups || [];
        var picturelessGroups = [];
        if (err) { console.error('Error retreiving groups.'); }
        processGroups(groups, 0);
      });
    },

    /* Look up a conversation in the history. If it's not there, create one
      and add it to the history.
    */
    findAndCreateConversation: function (identifier, options) {
      options = options || {};
      var noSaveList = options.noSaveList || false;
      var c = this.findWhere({id : identifier});
      if (c) {
        return c;
      }

      c = new ConversationModel({
        id : identifier,
        title: this._getConversationTitle(identifier)
      });
      this.listenTo(c.get('messages'), 'add', this._purgeOldMessages);
      this.add(c);
      // TODO: See inbox. Look for 'updateInbox'
      if (this._addConversation) {
        this._addConversation(c);
      }
      if (!noSaveList) { this.saveConversationList(); }
      return c;
    },

    removeConversation: function (identifier) {
      var c = this.findWhere({id : identifier});
      var messages = c ? c.get('messages') : [];
      messages.forEach(function (message) {
        messages.remove(message);
      });

      // Remove from history collection
      this.remove(c);

      // Remove the conversation from the AsyncStorage
      c.removeFromStorage();

      // Remove from contacts only if it is a group
      var contact = global.contacts.findWhere({id: identifier});
      if (contact && contact.get('isGroup')) {
        global.contacts.removeFromStorage(contact);
        global.contacts.remove(contact);
      }
      this.saveConversationList();
    },

    _purgeOldMessages: function () {

      console.log('[history] Checking for purge');

      // Let's see if we are running out of space
      var count = 0;
      var oldest = { conversation : null, date : null };

      this.forEach(function (conversation) {
        var messages = conversation.get('messages');
        if (messages && messages.size() > 0) {
          count += messages.size();
          var oldestMessageInConversation = messages.at(0);
          var meta = oldestMessageInConversation.get('meta');
          if (!meta || !meta.date) {
            return;
          }
          if (!oldest.date || meta.date < oldest.date) {
            oldest.conversation = conversation;
            oldest.date = meta.date;
          }
        }
      });

      console.log('[history] Current history size: ', count);
      // This event is called AFTER element was added
      if (count >= global.maxStoredMessages) {
        // We know that oldest.conversation has a message and is the one
        // to purge
        if (oldest && oldest.conversation) {
          console.log('[history] Purging one message');
          var messages = oldest.conversation.get('messages');
          messages.remove(messages.at(0));
        }
      }
    },

    comparator: function (conv, another) {
      return -(conv.get('date').getTime() - another.get('date').getTime());
    },

    _getNotificationTitle: function (from) {
      return (from.displayName) ? from.displayName :
        this._getConversationTitle(from.msisdn);
    },

    _getConversationTitle: function (identifier) {
      var name;
      try {
        name = PhoneNumber.format(identifier);
      } catch (e) {
        name = identifier;
      }
      return name;
    }

  });
});
