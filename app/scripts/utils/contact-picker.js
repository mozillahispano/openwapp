define([
  'global',
  'models/contact',
  'utils/phonenumber'
], function (global, Contact, PhoneNumber) {
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

      var activityContact = this.result;
      var phone = activityContact.number;
      global.client.confirmContacts([phone],
        function (err, details) {

          var contact = new Contact({
            'displayName': activityContact.name[0] || ''
          });

          if (err) {
            console.warn('The contact ' + phone + ' can not be confirmed.');
            var parsed = PhoneNumber.parse(phone);
            var msisdn = parsed ? parsed.full : phone;
            contact.set({
              'id': msisdn,
              'confirmed': false,
              'phone': msisdn
            });
            return callback('contact-not-confirmed', contact);
          }

          contact.set({
            'id': details[0].n,
            'confirmed': !!details[0].w,
            'state': details[0].s,
            'phone': details[0].n
          });

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
