define([
  'global',
  'models/contact'
], function (global, Contact) {
  'use strict';

  function pickContact(callback) {
    var pick = new window.MozActivity({
      name: 'pick',
      data: {
        type: 'webcontacts/contact'
      }
    });

    pick.onsuccess = function () {
      if (!this.result) { return callback(null, null); }

      var contact = Contact.fromActivity(this.result);
      var phone = contact.get('phone');
      global.client.getContactsState([phone],
        function (err, details) {
          if (err) {
            console.warn('The contact ' + phone + ' can not be confirmed.');
            contact.set('confirmed', false);
            return callback('contact-not-confirmed', contact);
          }

          contact.set({'confirmed': !!details[0].w, 'state': details[0].s});
          callback(null, contact);
        }
      );
    };

    pick.onerror = function (evt) {
      callback(evt.target.error);
    };
  }

  return pickContact;
});
