define([
  'backbone',
  'global',
  'utils/phonenumber',
  'utils/thumbnail'
], function (Backbone, global, PhoneNumber, thumbnail) {
  'use strict';

  var Contact = Backbone.Model.extend({
    idAttribute: 'id', /* phone number */

    maxPictureSize: 200,

    defaults: function () {
      return {
        // TODO: we should fully distinguish groups from contacts
        isGroup: false,
        admin: '',
        subject: null,
        displayName: null,
        phone: null,
        photo: null,
        _photo: '', // _photo is used to force the update of photo
                    // as Backbone is not able to say when a blob has
                    // changed.
        photoId: null,
        state: null,
        availability: null,
        confirmed: true
      };
    },

    set: function (key, val, options) {
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      if (!options) { options = {}; }

      // If modifying the photo, modify _photo in order to force a change
      // since Backbone is not able to correctly compare blobs.
      if (attrs.hasOwnProperty('photo')) {
        attrs._photo = '' + Date.now() + Math.random();
      }

      Backbone.Model.prototype.set.call(this, attrs, options);
    },

    initialize: function () {
      this.set('isGroup', this.get('id') && this.get('id').indexOf('-') >= 0);
      this.set('admin',
          this.get('isGroup') && (this.get('id').split('-')[0]));
      this.on('change:_photo', this.saveToStorage);
    },

    syncAllAndSave: function () {
      if (!this.get('isGroup')) {
        this.syncWithDeviceContact();
        this.once('synchronized:webcontacts', function () {
          this.saveToStorage();
          this.syncWithServer();
          this.once('synchronized:server', this.saveToStorage);
        });
      }
      else {
        this.syncWithServer();
        this.once('synchronized:server', this.saveToStorage);
      }
    },

    saveToStorage: function () {
      global.contacts.saveToStorage(this);
    },

    removeFromStorage: function () {
      global.contacts.removeFromStorage(this);
    },

    syncWithServer: function () {
      var _this = this;
      var remaining = 2;
      function progress(err) {
        if (err && err !== 'not-available') {
          console.log('Error synchronizing with the server.');
        }

        remaining--;
        if (!remaining) {
          _this.trigger('synchronized:server', _this);
        }
      }

      this.updatePhoto(progress);
      this.updateDetails(progress);
    },

    updatePhoto: function (callback) {
      var _this = this;
      global.client.getContactPicture(this.get('id') || this.get('phone'),
        function _onNewPicture(err, photoId, photo) {
          if (err) { return callback(err); }
          if (!photo) {
            callback(null, _this.get('photoId'), _this.get('photo'));
          }
          // Resize to be a small picture.
          else {
            thumbnail.setMaxSize(_this.maxPictureSize);
            thumbnail.generate(photo, function (err, resized) {
              _this.set({'photoId': photoId, 'photo': resized});
              callback(null, _this.get('photoId'), _this.get('photo'));
            }, { asBlob: true });
          }
        }
      );
    },

    updateDetails: function (callback) {
      if (this.get('isGroup')) {
        this.updateGroupSubject(callback);
      }
      else {
        this.updateState(callback);
      }
    },

    updateGroupSubject: function (callback) {
      var _this = this;
      global.client.getGroupSubject(this.get('id'), function (err, subject) {
        if (err) { return callback(err); }
        _this.set('subject', subject);
        callback(null, subject);
      });
    },

    updateState: function (callback) {
      var phones = [this.get('phone')];
      var _this = this;
      global.client.getContactsState(phones, function (err, statusMap) {
        if (err) { return callback(err); }
        statusMap = statusMap || {};
        var state = statusMap[_this.get('phone')] || '';
        _this.set('state', state);
        callback(null, _this.get('state'));
      });
    },

    syncWithDeviceContact: function () {
      var _this = this;
      if (navigator.mozContacts) {
        var request, contactPhone = this.get('phone');
        request = navigator.mozContacts.find({
          filterBy: ['tel'],
          filterOp: 'match',
          filterValue: '+' + contactPhone
        });

        request.onsuccess = function _sync() {
          console.log('Synching', contactPhone);
          var result = request.result[0];

          // TODO: Consider a smarter sync algorithm
          if (result) {
            var firstName = (result.givenName) ? result.givenName[0] : null;
            var lastName = (result.familyName) ? result.familyName[0] : null;
            var photo = (result.photo && result.photo.length > 0) ?
                        result.photo[0] : null;
            var name = _this._getDisplayName(firstName, lastName, contactPhone);

            // TODO: If we have the chance to find the specific tel we are
            // matching, sync the type of tel as well.
            if (photo) {
              thumbnail.setMaxSize(_this.maxPictureSize);
              thumbnail.generate(photo, function (err, resized) {
                _this.set({
                  'displayName': name,
                  'photo': !err ? resized : null
                });
                _this.trigger('synchronized:webcontacts', _this);
              }, { asBlob: true });
            }
            else {
              _this.set('displayName', name);
              _this.trigger('synchronized:webcontacts', _this);
            }
          }
          else {
            _this.trigger('synchronized:webcontacts', _this);
          }
        };

        request.onerror = function () {
          _this.trigger('synchronized:webcontacts', _this);
        };
      }
      else {
        console.warn('No mozContacts in the device. End of sync.');
        this.trigger('synchronized:webcontacts', this);
      }
    },

    _getDisplayName: function (firstName, lastName, phoneNumber) {
      var name = null;

      if (firstName && lastName) {
        name = firstName + ' ' + lastName;
      }
      else if (firstName || lastName) {
        name = firstName || lastName;
      } else {
        name = phoneNumber;
      }

      return name;
    }
  });

  return Contact;
});
