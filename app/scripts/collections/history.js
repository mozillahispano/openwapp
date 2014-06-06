define([
  'backbone',
  'global',
  'underscore',
  'vendor/async-storage/async-storage',
  'models/conversation',
  'models/message',
  'utils/phonenumber'
], function (Backbone, global, _, AsyncStorage, Conversation, MessageModel,
  PhoneNumber) {
  'use strict';

  return Backbone.Collection.extend({

    model: Conversation,

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

      var message = new MessageModel({
        type: meta.type,
        contents: content,
        from: from,
        meta: meta
      });

      this._addIncomingMessage(message);
    },

    _onTextReceived: function (from, meta, inContent) {
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
      this.findOrCreate(from.msisdn, null, function (err, result) {
        result.conversation.updateParticipantList();
      });
    },

    _onPictureNotification: function (from, meta, content) {
      content = content; // shut jslint up
      var contact = global.contacts.findWhere({phone: from.msisdn});
      contact.updatePhoto(function () { contact.saveToStorage(); });
    },

    _addIncomingMessage: function (message) {
      // lookup (or create) Conversation
      var from = message.get('from');
      this.findOrCreate(from.msisdn, null, function (err, result) {
        var conversation = result.conversation;
        var contact = conversation.get('contact');

        if (from.displayName) {
          if (!contact.get('displayName')) {
            contact.set('displayName', from.displayName);
          }
          if (!contact.get('isGroup')) {
            conversation.set('title', contact.get('displayName'));
          }
        }

        var contents = message.get('contents');
        var notificationBody = contents.address ||
                               contents.caption ||
                               contents;

        global.notifications.send(
          contact.get('displayName') || from.displayName,
          notificationBody,
          from.msisdn
        );

        var isRead = (!!global.router.currentView &&
                      global.router.currentView.model === conversation);
        conversation.set({
          isOnline: false,
          isRead: isRead
        });
        conversation.get('messages').add(message);
      });
    },

    saveConversationList: function (callback) {
      var list = this.models.map(function (conversation) {
        return conversation.get('id');
      });
      var _this = this;
      AsyncStorage.setItem('conversations', list, function () {
        console.log('[history] Saved conversation list');
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
        console.log('[history] All conversations are already loaded.');
        return;
      }

      console.log('[history] Loading conversations...');

      var _this = this;
      AsyncStorage.getItem('conversations', function (list) {
        if (!list || !list.length) {
          _this.finishedLoading = true;
          _this.trigger('history:loaded');
          return _this._syncGroups();
        }

        var sync = waitFor(list.length, function () {
          _this.finishedLoading = true;
          _this.trigger('history:loaded');
          _this._syncGroups();
        });

        list.forEach(function (id) {
          _this._loadFromStorage(id, sync);
        });
      });
    },

    _loadFromStorage: function (id, callback) {
      var key = 'conv:' + id;
      var _this = this;
      console.log('[history] Loading conversation:', id);
      AsyncStorage.getItem(key, function (conversation) {
        if (conversation) {
          console.log('[history] Conversation:', id, 'loaded!');
          conversation = _this.add(conversation).get(id);
          global.contacts.findOrCreate(conversation.get('id'), null,
            function (err, result) {
              conversation.set('contact', result.contact);
              callback(null, conversation);
            }
          );
        }
        else {
          console.log('[history] Conversation:', id, 'not found.');
          callback(null, null);
        }
      });
    },

    _syncGroups: function () {

      // Stall until logged
      if (!global.client.isOnline) {
        console.log('[history] Load groups stalled until login.');
        this.listenToOnce(global.auth, 'login:success', this._syncGroups);
        return;
      }

      console.log('[history] Syncing groups...');

      var _this = this;
      global.client.getGroups(function (err, groups) {
        groups = groups || [];
        var groupsLength = groups.length;

        function syncGroup(group, callback) {
          _this.findOrCreate(group.gid,
            { noSaveList: true },
            function (err, result) {
              if (result.isNew) {
                var conversation = result.conversation;
                setTimeout(function () {
                  conversation.get('contact').set('subject', group.subject);
                });
                _this._fetchPicture(conversation);
              }
              callback();
            }
          );
        }

        function processGroups(offset) {
          var index = offset;
          if (index === groupsLength) {
            _this.saveConversationList();
            _this.finishedSyncing = true;
            _this.trigger('history:synced');
          }
          else {
            /* jshint validthis: true */
            syncGroup(groups[index], processGroups.bind(this, index + 1));
          }
        }

        if (err) { console.error('Error retreiving groups.'); }
        processGroups(0);
      });
    },

    _pictureQueue: [],

    _fetchPicture: function (conversation) {
      var _this = this;

      function _nextFetch() {
        if (_this._pictureQueue.length > 0) {
          var task = _this._pictureQueue[0];
          task(function _onFinished() {
            _this._pictureQueue.shift();
            _nextFetch();
          });
        }
      }

      this._pictureQueue.push(function fetchTask(next) {
        conversation.get('contact').updatePhoto(next);
      });

      if (this._pictureQueue.length === 1) {
        _nextFetch();
      }

    },

    findOrCreate: function (id, options, callback) {
      options = options || {};
      var noSaveList = options.noSaveList || false;
      var conversationSubject = options.subject || null;

      var _this = this;
      var isNew = false;
      var conversation = this.findWhere({id : id});

      // The conversation is not cached
      if (!conversation) {

        this._loadFromStorage(id, function (err, conversation) {

          // TODO: I don't like this here. It should be a separated method
          // called when loading a contact from storage or when created in
          // this method.
          function postLoad(conversation) {
            _this.listenTo(
              conversation.get('messages'), 'add', _this.purgeOldMessages);

            if (!noSaveList) {
              _this.saveConversationList();
            }
          }

          // The conversation is not persisted yet
          if (!conversation) {
            isNew = true;

            // Asssociate the proper contact
            global.contacts.findOrCreate(id, null,
              function (err, result) {
                conversation = _this.add({
                  id: id,
                  title: conversationSubject || _this._getConversationTitle(id)
                }).get(id);
                conversation.set('contact', result.contact);
                _this.saveToStorage(conversation);
                postLoad(conversation);
                callback(null, {
                  isNew: isNew,
                  conversation: conversation
                });
              }
            );
          }
          else {
            postLoad(conversation);
            callback(null, {
              isNew: isNew,
              conversation: conversation
            });
          }

        });
      }
      else {
        callback(null, {
          isNew: isNew,
          conversation: conversation
        });
      }
    },

    saveToStorage: function (conversation) {
      var key = this._getStorageKey(conversation);
      console.log('[history] Saving conversation', key);
      AsyncStorage.setItem(key, this._serialize(conversation));
    },

    _getStorageKey: function (conversation) {
      return 'conv:' + conversation.get('id');
    },

    _serialize: function (conversation) {
      var attr = _.clone(conversation.attributes);
      delete attr.messages;
      delete attr.contact;
      return attr;
    },

    removeConversation: function (identifier) {
      var conversation = this.findWhere({id : identifier});
      var contact = conversation.get('contact');

      var messages = conversation ? conversation.get('messages') : [];
      messages.forEach(function (message) {
        messages.remove(message);
      });

      // Remove from history collection
      this.remove(conversation);

      // Remove the conversation from the AsyncStorage
      this.removeFromStorage(conversation);

      // Remove from contacts only if it is a group
      if (contact && contact.get('isGroup')) {
        global.contacts.removeFromStorage(contact);
        global.contacts.remove(contact);
      }
      this.saveConversationList();
    },

    removeFromStorage: function (conversation) {
      var key = this._getStorageKey(conversation);
      AsyncStorage.removeItem(key);
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
