define([
  'backbone',
  'global',
  'underscore',
  'models/contact',
  'zeptojs',
  'utils/phonenumber',
  'storage/dbmanager',
  'storage/auth'
], function (Backbone, global, _, Contact, $, PhoneNumber, DbManager,
  authStorage) {
  'use strict';

  var Contacts = Backbone.Collection.extend({
    model: Contact,

    comparator: 'displayName',

    initialize: function () {
      this.sentContactNumbers = [];
      this.registeredToListenContacts = false;
      this.userMsisdn = null;
      this._getUserMsisdn();
    },

    _getUserMsisdn: function () {
      var _this = this;
      if (global.auth.get('msisdn')) {
        _this.userMsisdn = global.auth.get('msisdn');
        _this._initContacts();
      } else {
        authStorage.load(function (userId, password, msisdn) {
          if (msisdn) {
            _this.userMsisdn = msisdn;
            _this._initContacts();
          }
          else {
            console.log('Error cannot retreive user msisdn, ' +
                        'probably first user connection');
            // Wait for msisdn change
            _this.listenTo(global.auth, 'change:msisdn', function () {
              _this.userMsisdn = global.auth.get('msisdn');
              _this._initContacts();
            });
          }
        });
      }
    },

    _initContacts: function () {
      PhoneNumber.setBaseNumber(this.userMsisdn);
      this._fetchContactsFromStorage();
      this.listenTo(global.rtc, 'availability:available',
        this._updateAvailability);
      this.listenTo(global.rtc, 'availability:unavailable',
        this._updateAvailability);
    },

    _updateAvailability: function (from, content) {
      var contact = this.findWhere({ phone: from.msisdn });
      if (contact) {
        contact.set('availability', content.state);
      }
    },

    /**
     * Current contacts are the sum of contacts into the OpenWapp storage of
     * contacts and those from recent conversations.
     */
    _fetchContactsFromStorage: function () {
      var _this = this;
      DbManager.read({
        loadWithCursor: true,
        store: DbManager.dbContactsStore,
        sortedBy: 'displayName',
        callback: function (err, cursor) {
          console.log('[contacts] Fetching users from storage.');

          if (cursor) {
            _this.addNewContact(cursor.value);
            /* jshint es5:true */
            cursor.continue();
            /* jshint es5:false */
          }
          else if (global.historyCollection.finishedLoading) {
            _this._fetchContactsFromRecentConversations();
          }
          else {
            global.historyCollection.once('history:loaded',
              _this._fetchContactsFromRecentConversations.bind(_this));
          }
        }
      });
    },

    // TODO: Consider listening for new additions to the history collection
    // to add the owner to the contact list automatically.
    _fetchContactsFromRecentConversations: function () {
      console.log('[contacts] Fetching from recent conversations.');

      var msisdn,
          conversations = global.historyCollection.models;

      for (var i = 0, l = conversations.length; i < l; i++) {
        msisdn = conversations[i].get('id');
        if (!this.findWhere({ id: msisdn })) {
          console.log('[contacts] Adding not found contact', msisdn,
                      'from a recent conversation');
          this.addNewContact({ id: msisdn, phone: msisdn });
        }
      }

      this.isLoaded = true;
      this.trigger('complete', this.models);
    },

    findAndCreateContact: function (phone, displayName) {
      var contact = global.contacts.findWhere({phone: phone});
      var isNew = false;
      if (!contact) {
        isNew = true;
        contact = this.addNewContact({
          id: phone,
          phone: phone,
          displayName: displayName || '+' + phone,
          subject: displayName
        });
      }
      return {
        contact: contact,
        isNew: isNew
      };
    },

    addNewContact: function (contactProperties) {
      var contact = new Contact(contactProperties);
      this.add(contact);
      contact.saveToStorage();
      return contact;
    },

    saveToStorage: function (contact) {
      console.log('[contacts] Saving', contact.get('phone'));
      DbManager.save({
        store: DbManager.dbContactsStore,
        value: {
          id: contact.get('phone'),
          subject: contact.get('subject'),
          displayName: contact.get('displayName') || '+' + contact.get('phone'),
          phone: contact.get('phone'),
          photo: contact.get('photo'),
          photoId: contact.get('photoId'),
          state: contact.get('state'),
          confirmed: contact.get('confirmed')
        },
        callback: function (err) {
          if (err) {
            console.error('[contacts] Error saving contact:' + err);
            return;
          }
          console.log('[contacts]', contact.get('phone'), 'saved');
        }
      });
    },

    removeFromStorage: function (contact) {
      console.log('[contacts] Removing', contact.get('phone'));
      DbManager.remove({
        store: DbManager.dbContactsStore,
        key: contact.get('phone'),
        callback: function (err) {
          if (err) {
            console.error('[contacts] Error removing contact:' + err);
            return;
          }
          console.log('[contacts]', contact.get('phone'), 'removed');
        }
      });
    },

    getParticipantName: function (phone) {
      if (!phone) {
        console.warn('Unknown participant.');
        var unknownId = 'unknownParticipant';
        return global.localisation[global.language][unknownId];
      }

      if (global.auth.isMe(phone)) {
        return global.auth.get('screenName');
      }

      var contact = global.contacts.findAndCreateContact(phone).contact;
      return contact.get('displayName');
    }
  });

  return Contacts;
});
