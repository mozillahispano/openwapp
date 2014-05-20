define([
  'backbone',
  'underscore',
  'global',
  'collections/messages',
  'models/message',
  'vendor/async-storage/async-storage',
  'storage/dbmanager'
], function (Backbone, _, global, MessagesCollection, MessageModel,
  AsyncStorage, DbManager) {
  'use strict';

  // TODO: Actually, conversations are not associated explicitely to a  contact.
  // Consider make this association explicit while maintaining future
  // compatibility for groups. This will simplify group / contact dependant
  // characteristics of conversation such as the image.
  var Conversation = Backbone.Model.extend({

    idAttribute: 'id', /* phone number for 1-to-1 chats, long for groups */

    defaults: function () {
      return {
        'isGroup': false,
        'title' : 'Untitled',
        'lastMessage' : '',
        'lastMessageType': 'text',
        'isRead' : true,
        'messages' : new MessagesCollection(),
        'date': new Date()
      };
    },

    initialize: function () {
      this.listenTo(this.get('messages'), 'reset', this.updateLastMessage);
      this.listenTo(this.get('messages'), 'add', this.updateLastMessage);
      this.listenTo(this.get('messages'), 'add', this._onAddMessage);

      var contact = this._lookupContact();
      if (!contact) {
        // try it again later
        this.listenTo(global.contacts, 'add', this._lookupContact);
      }

      this.set('isGroup', this.get('id').indexOf('-') >= 0);
    },

    isEmpty: function () {
      if (this.get('messages').size() !== 0) {
        return false; // there's messages in memory
      }

      // there's no messages, but it could be because we haven't read from DB
      // yet all of them - so use lastMessage as a fallback
      return this.get('lastMessage') === '';
    },

    unregister: function () {
      this.get('messages').forEach(function (message) {
        message.unregister();
      });

      this.get('messages').reset();
    },

    updateLastMessage: function () {
      var messages = this.get('messages');
      if (messages && messages.size()) {
        var last = messages.at(messages.size() - 1);
        this.set('lastMessage', last.getSummary());
        this.set('lastMessageType', last.get('type'));
      }
    },

    saveToStorage: function (callback) {
      var key = this.getStorageKey();
      var _this = this;
      AsyncStorage.setItem(key, this._serialize(), function () {
        console.log('Saved conversation', key,
          _this.get('date').toLocaleString());
        _this.trigger('conversation:save', _this);
        if (callback) { callback(); }
      });
    },

    removeFromStorage: function (callback) {
      var key = this.getStorageKey();
      var _this = this;
      AsyncStorage.removeItem(key, function () {
        console.log('Removed conversation', key,
          _this.get('date').toLocaleString());
        _this.trigger('conversation:remove', _this);
        if (callback) { callback(); }
      });
    },

    loadMessagesFromStorage: function (callback) {
      var _this = this;
      var messages = [];
      DbManager.read({
        store : DbManager.dbMessagesStore,
        sortedBy : 'conversationId',
        value : this.get('id'),
        loadWithCursor : true,
        continueOnError : true,
        reverse: true,
        callback : function (error, item) {
          if (item && item.value) {
            var message = MessageModel.newFromStorage(item.value);
            messages.push(message);
          } else {
            _this.get('messages').mergeById(messages);
            if (callback) { callback(); }
            return;
          }

          /* jshint es5:true */
          item.continue();
          /* jshint es5:false */
        }
      });
    },

    getStorageKey: function () {
      return 'conv:' + this.get('id');
    },

    _serialize: function () {
      var attr = _.clone(this.attributes);
      delete attr.messages;
      return attr;
    },

    _onAddMessage: function (message) {
      var isLastMessage = function (messages, message) {
        // TODO: we should be able to pass 'true', as optional parameter to
        // indexOf, since the messages array is supposed to be sorted!
        // It doesn't work, however
        return messages.length && messages.at(messages.length - 1) === message;
      };

      message.set({
        conversationId: this.get('id')
      });

      var _this = this;
      message.saveToStorage(function () {
        var updates = {};
        // update last msg & date if this is the last message chronologically
        if (isLastMessage(_this.get('messages'), message)) {
          updates.lastMessage = message.getSummary();
          updates.date = message.get('meta') ?
            new Date(message.get('meta').date.getTime()) : new Date();
          updates.lastMessageType = message.get('type');
        }
        _this.set(updates);
        _this.saveToStorage();
        _this.trigger('message:added', message);
      });

    },

    getAndUpdateLastMessageDate: function () {
      var messages = this.get('messages');
      var lastMessage = (messages && messages.size()) ?
                          messages.at(messages.size() - 1) : undefined;
      var date = lastMessage ? lastMessage.get('meta').date : this.get('date');
      date = date ? date : new Date(2000, 1, 1); // default to 'very old'
      this.set('date', date); // this is needed to place it in inbox while
                              // loading from storage and messages haven't yet
                              // been loaded
      return date;
    },

    /**
     * Update Conversation title when contact change
     * @param  model contact model
     */
    _onContactChanged: function (model) {
      if (!this.get('isGroup')) {
        this.set('title', model.get('displayName'));
      }
      else {
        this.set('title', model.get('subject'));
        this.set('participants', model.get('participants'));
      }
    },

    _lookupContact: function () {
      var contact = global.contacts.findWhere({phone: this.get('id')});
      if (contact) {
        // set the initial conversation name
        this._onContactChanged(contact);
        // listen for changes
        this.listenTo(contact, 'change', this._onContactChanged);
        this.stopListening(global.contacts, 'add', this._lookupContact);
      }
      return contact;
    },

    updateParticipantList: function () {
      this.trigger('dirty:participants');
    }

  }, {
    // static methods and vars
    loadFromStorage: function (id, callback) {
      var key = 'conv:' + id;
      AsyncStorage.getItem(key, function (value) {
        console.log('[conversation] Loading conversation', key,
          (value ? 'OK' : 'FAILED'));

        if (!value) {
          callback(null);
        } else {
          var c = global.historyCollection.findAndCreateConversation(id);
          c.set(value);
          callback(c);
        }
      });
    }
  });

  return Conversation;
});
