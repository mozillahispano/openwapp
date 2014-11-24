define(['vendor/async-storage/async-storage'], function (AsyncStorage) {
  'use strict';

  return {
    store: function (userId, password, msisdn, mcc, mnc, profile, callback) {
      AsyncStorage.setItem('credentials', {
        userId: userId,
        password: password,
        msisdn: msisdn,
        profile: {
          screenName: profile.screenName,
          status: profile.status,
          photo: profile.photo,
          thumb: profile.thumb
        },
        mcc: mcc,
        mnc: mnc
      }, callback);
    },

    storeProfileData: function (screenName, status, photo, thumb, callback) {
      AsyncStorage.getItem('credentials', function (credentials) {
        if (credentials) {
          AsyncStorage.setItem('credentials', {
            userId: credentials.userId,
            password: credentials.password,
            msisdn: credentials.msisdn,
            profile: {
              screenName: screenName,
              status: status,
              photo: photo,
              thumb: thumb
            },
            mcc: credentials.mcc,
            mnc: credentials.mnc
          }, callback);
        }

      });

    },

    load: function (callback) {
      AsyncStorage.getItem('credentials', function (credentials) {
        var userId = null,
            password = null,
            msisdn = null,
            profile = null,
            mcc = '000',
            mnc = '000';

        if (credentials) {
          userId = credentials.userId;
          password = credentials.password;
          msisdn = credentials.msisdn;
          profile = credentials.profile;
          mcc = credentials.mcc;
          mnc = credentials.mnc;
        }
        if (callback) {
          callback(userId, password, msisdn, mcc, mnc, profile);
        }
      });
    },

    clear: function (callback) {
      AsyncStorage.removeItem('credentials', callback);
    }
  };
});
