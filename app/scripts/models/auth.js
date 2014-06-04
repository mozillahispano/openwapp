define([
  'backbone',
  'global',
  'storage/auth',
  'utils/connectivity',
  'utils/phonenumber'
], function (Backbone, global, authStorage, connectivity, PhoneNumber) {
  'use strict';

  var Auth = Backbone.Model.extend({
    defaults: function () {
      return {
        userId: null,
        password: null,
        msisdn: null,
        screenName: null,
        status: null,
        photo: null,
        thumb: null
      };
    },

    RETRY_TIME: 5 * 1000, // 5s

    initialize: function () {
      this.listenTo(global.client, 'disconnected',
        this._retryLoginBecauseOfErrors);
    },

    checkCredentials: function () {

      // Credentials are loaded
      if (this.get('userId')) {
        this._tryToLogin(
          this.get('userId'), this.get('password'), this.get('msisdn'));
      }

      // Credentials are not yet loaded
      else {
        var _this = this;
        authStorage.load(function (userId, password, msisdn, profile) {
          if (profile) {
            _this.set('photo', profile.photo || null);
            _this.set('thumb', profile.thumb || null);
            _this.set('status', profile.status || null);
            _this.set('screenName', profile.screenName || null);
          }
          if (msisdn) {
            // TODO: Here there is a race condition we should avoid.
            // This should be recovered before allowing adding participants.
            PhoneNumber.setBaseNumber(msisdn);
            _this.set('msisdn', msisdn);
          }
          if (userId && password) {
            _this._tryToLogin(userId, password, msisdn);
          } else {
            _this.trigger('login:fail', 'missing-credentials');
          }
        });
      }
    },

    _tryToLogin: function (userId, pass, msisdn) {
      if (connectivity.get('online') && !global.client.isOnline) {
        console.log('[auth] Logging in...');
        this._login(userId, pass, msisdn);
      }
      else {
        console.warn('[auth] No connectivity, impossible to log in.');
        this.listenToOnce(connectivity, 'change:online', function (isOnline) {
          if (isOnline) {
            this._tryToLogin(userId, pass, msisdn);
          }
        });
      }
    },

    _login: function (userId, pass, msisdn) {
      if (this.intervalLoginRetries) {
        window.clearInterval(this.intervalLoginRetries);
      }

      var _this = this;
      global.client.auth(userId, pass, function (err) {

        if (err === 'auth-failed') {
          _this.trigger('login:fail');
          return;
        }

        // TODO: Distinguish when the error is expired to warn the users about
        // the state of their account.
        else if (err) {
          _this._retryLoginBecauseOfErrors();
          return;
        }

        console.log('WA PASSWORD: ' + pass);

        _this.set('password', pass);
        _this.set('msisdn', msisdn);

        authStorage.store(userId, pass, msisdn, {
          screenName: _this.get('screenName'),
          status: _this.get('status'),
          photo: _this.get('photo'),
          thumb: _this.get('thumb')
        });

        _this.trigger('login:success');
      });
    },

    _retryLoginBecauseOfErrors: function () {
      console.log('[auth] Error in login. Retrying every ' +
                  this.RETRY_TIME / 1000 + ' seconds...');
      var _this = this;
      this.intervalLoginRetries = window.setTimeout(function () {
        _this.checkCredentials();
      }, this.RETRY_TIME);
    },

    register: function (countryCode, phoneNumber, locale, callback) {
      var _this = this;
      global.client
        .register(
          countryCode, phoneNumber, locale, function (err, response) {
            if (err) {
              return callback(err, response);
            }

            var needsValidation = true;
            if (_this._includeCredentials(response)) {
              var params = _this._parseApiResults(response);
              params.msisdn = countryCode + phoneNumber;
              _this.set(params);
              needsValidation = false;
            }
            callback(null, needsValidation);
          }
        );
    },

    _includeCredentials: function (response) {
      return response && response.pw && response.login;
    },

    _parseApiResults: function (result) {
      return {
        userId: result.login,
        password: result.pw,
        // TODO: remove all of this when checked
        storageUrl: 'no storage url',
        sipCredentials: {
          username: 'no username',
          password: 'no password',
          domain: 'no domain',
          server: 'no server'
        }
      };
    },

    validate: function (countryCode, phone, pin, screenName, callback) {
      var _this = this;
      global.client.validate(
        countryCode, phone, pin, screenName, function (err, result) {
          if (err) {
            return callback(err, result);
          }

          var params = _this._parseApiResults(result);
          params.msisdn = countryCode + phone;
          _this.set(params);
          callback(null);
        }
      );
    },

    _onceLogged: function (callback) {
      if (!callback) { return; }
      if (global.client.isOnline) {
        callback.call(this);
      } else {
        this.once('login:success', callback.bind(this));
        this.checkCredentials();
      }
    },

    getProfilePicture: function (callback) {
      this._onceLogged(function () {
        global.client.getContactPicture(this.get('msisdn'),
          function (error, pictureId, picture) {
            if (error) {
              callback(error);
              return;
            }
            callback(null, picture);
          });
      });
    },

    getProfileStatus: function (callback) {
      this._onceLogged(function () {
        global.client.getContactsState([this.get('msisdn')],
          function (error, phoneMap) {
            if (error) {
              callback(error);
              return;
            }
            callback(null, phoneMap && phoneMap[this.get('msisdn')]);
          }.bind(this));
      });
    },

    updateProfileData: function (screenName, status, photo, thumb) {
      this.set({
        screenName: screenName,
        status: status,
        photo: photo,
        thumb: thumb
      });
      authStorage.storeProfileData(screenName, status, photo, thumb);

      if (global.client.isOnline) {
        this._sendProfileData();
      }
      else {
        this.once('login:success', this._sendProfileData);
      }
    },

    _sendProfileData: function () {
      if (global.rtc.get('status') === 'online') {
        global.client.updateProfile({
          name: this.get('screenName'),
          status: this.get('status'),
          photo: this.get('photo'),
          thumb: this.get('thumb')
        });
        this.stopListening(global.rtc, 'change:status', this._sendProfileData);
      }
    },

    isMe: function (msisdn) {
      return msisdn === this.get('msisdn');
    }

  });

  return Auth;
});
