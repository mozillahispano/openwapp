define([
  'backbone',
  'global',
  'underscore',
  'models/contact',
  'zeptojs',
  'storage/dbmanager'
], function (Backbone, global, _, Contact, $, DbManager) {
  'use strict';

  var Contacts = Backbone.Collection.extend({

    model: Contact,

    comparator: 'displayName',

    initialize: function () {
      this.listenTo(global.rtc,
        'availability:available', this._updateAvailability);

      this.listenTo(global.rtc,
        'availability:unavailable', this._updateAvailability);
    },

    _updateAvailability: function (from, content) {
      var contact = this.findWhere({ phone: from.msisdn });
      if (contact) {
        contact.set('availability', content.state);
      }
    },

    getGroups: function () {
      return this.where({ isGroup: true });
    },

    findOrCreate: function (phone, displayName, callback) {
      var _this = this;
      var isNew = false;
      var contact = global.contacts.findWhere({phone: phone});

      // The contact is not cached
      if (!contact) {

        this._loadFromStorage(phone, function (err, contact) {

          // The contacts is not persisted yet
          if (!contact) {
            isNew = true;
            contact = _this.add({
              id: phone,
              phone: phone,
              displayName: displayName || '+' + phone,
              subject: displayName
            });
            _this.saveToStorage(contact);
          }

          callback(null, {
            isNew: isNew,
            contact: contact
          });
        });
      }
      else {
        callback(null, {
          isNew: isNew,
          contact: contact
        });
      }
    },

    _loadFromStorage: function (phone, callback) {
      var _this = this;
      DbManager.read({
        store: DbManager.dbContactsStore,
        value: phone,
        callback: function (err, items) {
          console.log('[contacts] Loading contact', phone, 'from storage.');
          var contact = items && items[0] || null;
          if (contact) {
            contact = _this.add(contact);
          }
          callback(err, contact);
        }
      });
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
        return navigator.mozL10n.get('unknownParticipant');
      }

      if (global.auth.isMe(phone)) {
        return global.auth.get('screenName');
      }

      var contact = this.get(phone);
      if (contact) {
        return contact.get('displayName');
      }

      return '+' + phone;
    }
  });

  return Contacts;
});
