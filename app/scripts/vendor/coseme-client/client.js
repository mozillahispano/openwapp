// Boilerplate to make the same code work on CommonJS (Node.js) and AMD
// (Require.js)
//
// Source: https://github.com/umdjs/umd
//
(function (root, factory) {
  'use strict';
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require('coseme'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['coseme'], factory);
  } else {
    // Browser globals (root is window)
    root.openwappClient = factory(root.CoSeMe);
  }
}(this, function (CoSeMe) {
  'use strict';

  var _userId, _password;
  var _mediaUploadRequests = {};
  var _authSuccessCallback = null;
  var _authErrorCallback = null;
  var _contactPictureRequests = {};
  var _contactStatusRequests = {};
  var _contactPictureIdRequests = {};
  var _groupCreateRequests = {};
  var _groupParticipantRequests = {};
  var _participatingGroupsRequests = {};
  var _groupInfoRequests = {};
  var _setPictureRequests = {};
  var _presenceRequests = {};
  var _seedForId, _sdcard;

  var SEED_FILENAME = '.openwapp_seed';

  if (typeof window.navigator.getDeviceStorage === 'function') {
    _sdcard = navigator.getDeviceStorage('sdcard');
  }
  else {
    console.error('There is no getDeviceStorage API');
    _seedForId = 'c9qjareu'; // testing purposes
  }

  function getSeed(callback) {
    var err;
    if (_seedForId) {
      return callback(null, _seedForId);
    }
    if (!_sdcard) {
      return callback('no-sdcard');
    }

    // Get the file handler
    console.log('OpenWapp: Getting the seed file from sdcard: ' +
                SEED_FILENAME);
    var request = _sdcard.get(SEED_FILENAME);
    request.onsuccess = function _getFileSuccess() {
      var file = this.result;

      // Reads the contents
      var reader = new FileReader();
      reader.onloadend = function () {
        console.log('OpenWapp: seed is ' + this.result);
        _seedForId = this.result;
        callback(null, _seedForId);
      };
      reader.onerror = function () {
        console.error('OpenWapp: error reading the seed!');
        callback('error-reading');
      };
      reader.readAsBinaryString(file);
    };
    request.onerror = function _getFileError() {
      console.error('OpenWapp: seed file does not exist!');
      callback('not-exist');
    };
  }

  function saveSeed(seed, callback) {
    _seedForId = seed;
    if (!_seedForId) {
      return callback && callback('no-seed');
    }
    if (!_sdcard) {
      return callback && callback('no-sdcard');
    }

    console.log('OpenWapp: saving the seed.');
    var content = new Blob([_seedForId], { type: 'text/plain' });
    var request = _sdcard.addNamed(content, SEED_FILENAME);
    request.onsuccess = function _addFileSuccess() {
      console.log('OpenWapp: seed ' + _seedForId + ' saved!');
      callback && callback(null);
    };
    request.onerror = function _addFileError() {
      console.error('OpenWapp: impossible to save the seed.');
      callback && callback('open-fail');
    };
  }

  // Actual module implementation
  return {
    init: function() {
      var appVersion = 0.5;
      var yowsup = CoSeMe.yowsup;

      // Default properties map, 20140702
      var defaultProperties = {
        'audio': 1,
        'broadcast': 50,
        'checkmarks': 0,
        'image_max_edge': 1280,
        'image_max_kbytes': 5120,
        'image_quality': 80,
        'library': 0,
        'lists': 1,
        'location': 0,
        'max_groups': 50,
        'max_participants': 51,
        'max_subject': 25,
        'media': 16,
        'newmedia': 0,
        'qr': 0,
        'timeout': 300
      };
      var properties;

      var signals = yowsup.getSignalsInterface();
      var methods = yowsup.getMethodsInterface();

      // Event setup
      var _callbacks = {};
      function getCallbacks(type) {
        return (_callbacks[type] || (_callbacks[type] = []));
      }

      function on(type, callback, self) {
        getCallbacks(type).push(callback.bind(self));
      }

      function off(type, callback) {
        var index = getCallbacks(type).indexOf(callback);
        _callbacks[type].splice(index, 1);
      }

      function fire(type) {
        var args = [].slice.call(arguments, 1);
        getCallbacks(type).forEach(function(callback) {
          callback.apply(null, args);
        });
      }

      // Auth setup
      signals.registerListener('auth_success', onAuthSuccess);
      signals.registerListener('auth_fail', onAuthError);
      signals.registerListener('got_properties', onGotProperties);

      function onAuthSuccess() {
        if (_authSuccessCallback) {
          _authSuccessCallback();
        }
        _authSuccessCallback = null;
        fire('connected');
      }

      function onAuthError(username, _, reason) {
        if (_authErrorCallback) {
          _authErrorCallback(reason);
        }
        _authErrorCallback = null;
        fire('disconnected');
      }

      function onGotProperties(props) {
        properties = props;
      }

      // Contact status
      signals.registerListener('contacts_gotStatus', onStatusesReceived);
      signals.registerListener('contact_gotProfilePicture', onPictureReceived);
      signals.registerListener('group_gotPicture', onPictureReceived);
      signals.registerListener(
        'contact_gotProfilePictureId', onPictureIdReceived);
      signals.registerListener('presence_updated', onPresenceUpdated);
      signals.registerListener('profile_setPictureError', onSetPicture);
      signals.registerListener('profile_setPictureSuccess', onSetPicture);

      function defaultHandler(id) {
        console.warn('No handler for response message:', id);
      }

      function onStatusesReceived(id, statuses) {
        var callback = _contactStatusRequests[id] ||
                       defaultHandler.bind(undefined, id);
        delete _contactStatusRequests[id];
        callback(null, statuses);
      }

      function onPictureReceived(fromJID, pictureId, picture) {
        var callback = _contactPictureRequests[fromJID];
        delete _contactPictureRequests[fromJID];
        if (callback) {
          if (!pictureId && !picture) {
            return callback('not-available');
          }
          callback(null, pictureId, picture);
        }
      }

      function onPictureIdReceived(fromJID, pictureId) {
        var callback = _contactPictureIdRequests[fromJID];
        delete _contactPictureIdRequests[fromJID];
        if (callback) {
          callback(null, pictureId);
        }
      }

      function onPresenceUpdated(fromJID, lastSeenInSeconds) {
        var callback = _presenceRequests[fromJID];
        delete _presenceRequests[fromJID];
        if (callback) {
          callback(null, lastSeenInSeconds);
        }
      }

      function onSetPicture(pictureId, id) {
        var callback = _setPictureRequests[id];
        delete _setPictureRequests[id];
        if (callback) {
          var err = pictureId === 0 ? 'not-acceptable' : undefined;
          callback(err, pictureId);
        }
      }

      // Sending and receiving messages
      signals.registerListener('receipt_messageSent', onMessageSent);
      signals.registerListener('receipt_messageDelivered', onMessageDelivered);
      signals.registerListener('message_received', onMessageReceived);
      signals.registerListener('group_messageReceived', onGroupMessageReceived);
      signals.registerListener('location_received', onLocationReceived);
      signals.registerListener('group_locationReceived',
        onGroupLocationReceived);
      signals.registerListener('contact_typing', onContactTyping);
      signals.registerListener('contact_paused', onContactPaused);
      signals.registerListener('presence_available', onContactAvailable);
      signals.registerListener('presence_unavailable', onContactUnavailable);
      signals.registerListener('disconnected', onDisconnected);

      // Multimedia
      signals.registerListener('image_received',
        onMultiMediaReceived.bind(this, 'image'));

      signals.registerListener('group_imageReceived',
        onGroupMultiMediaReceived.bind(this, 'image'));

      signals.registerListener('video_received',
        onMultiMediaReceived.bind(this, 'video'));

      signals.registerListener('group_videoReceived',
        onGroupMultiMediaReceived.bind(this, 'video'));

      signals.registerListener('audio_received', onAudioReceived);
      signals.registerListener('group_audioReceived', onGroupAudioReceived);

      // Notifications
      signals.registerListener(
        'notification_groupCreated',
        onSubjectUpdated
      );

      signals.registerListener(
        'notification_groupSubjectUpdated',
        onSubjectUpdated
      );

      signals.registerListener(
        'notification_groupParticipantAdded',
        onGroupParticipantEvent.bind(undefined, 'add')
      );

      signals.registerListener(
        'notification_groupParticipantRemoved',
        onGroupParticipantEvent.bind(undefined, 'remove')
      );

      signals.registerListener(
        'notification_groupPictureUpdated',
        onGroupPictureEvent.bind(undefined, 'update')
      );

      signals.registerListener(
        'notification_groupPictureRemoved',
        onGroupPictureEvent.bind(undefined, 'remove')
      );

      function onSubjectUpdated(senderJID, timestamp, messageId,
                                subject, displayName, author) {
        fire('notification', pub,
          newNotification('group-subject', messageId, senderJID,
                          { subject: subject }, displayName, author)
        );
        methods.call('notification_ack', [senderJID, messageId]);
      }

      function onGroupParticipantEvent(event, senderJID, jid, _,
                                       timestamp, messageId) {
        fire('notification', pub,
          newNotification('group-participant', messageId, senderJID,
                          { event: event, participant: jid.split('@')[0] })
        );
        methods.call('notification_ack', [senderJID, messageId]);
      }

      function onGroupPictureEvent(event, senderJID, timestamp, messageId,
                                   pictureId, author) {
        fire('notification', pub,
          newNotification('group-picture', messageId, senderJID,
                          { event: event, pictureId: pictureId }, null, author)
        );
        methods.call('notification_ack', [senderJID, messageId]);
      }

      function newNotification(type, messageId, senderJID,
                               content, displayName, author) {
        return {
          messageId: messageId,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: displayName || undefined,
            authorMsisdn: !author ? undefined : author.split('@')[0]
          },
          content: content,
          type: type
        };
      }

      // Group specific
      signals.registerListener('group_gotParticipating', onParticipatingGroups);
      signals.registerListener('group_createSuccess', onGroupCreateSuccess);
      signals.registerListener('group_createFail', onGroupCreateFail);
      signals.registerListener('group_gotInfo', onGroupInfoReceived);
      signals
        .registerListener('group_gotParticipants', onGroupParticipantsReceived);

      function onParticipatingGroups(groups, id) {
        var callback = _participatingGroupsRequests[id];
        delete _participatingGroupsRequests[id];
        callback && callback(null, groups);
      }

      function onGroupCreateSuccess(gid, id) {
        var callback = _groupCreateRequests[id];
        delete _groupCreateRequests[id];
        callback && callback(null, gid);
      }

      function onGroupCreateFail(errorCode, id) {
        var callback = _groupCreateRequests[id];
        delete _groupCreateRequests[id];
        callback && callback(errorCode);
      }

      function onGroupInfoReceived(jid, owner, subject) {
        var callback = _groupInfoRequests[jid];
        delete _groupInfoRequests[jid];
        callback && callback(subject);
      }

      function onGroupParticipantsReceived(jid, list) {
        var callback = _groupParticipantRequests[jid];
        delete _groupParticipantRequests[jid];
        callback && callback(list);
      }

      function onDisconnected() {
        fire('disconnected');
      }

      function onMessageSent(senderJID, messageId) {
        fire('messageSent', messageId);
      }

      function onMessageDelivered(senderJID, messageId) {
        fire('messageDelivered', senderJID.split('@')[0], messageId);
        methods.call('delivered_ack', [senderJID, messageId]);
      }

      // Media
      signals.registerListener('media_uploadRequestSuccess', onMediaRequest);
      signals.registerListener('media_uploadRequestFailed', onMediaFail);
      signals.registerListener('media_uploadRequestDuplicate', onMediaDup);

      function onMediaRequest(sha256, uploadUrl) {
        var callback = _mediaUploadRequests[sha256];
        _mediaUploadRequests[sha256] = undefined;
        callback && callback(null, uploadUrl);
      }

      function onMediaFail(sha256) {
        var callback = _mediaUploadRequests[sha256];
        _mediaUploadRequests[sha256] = undefined;
        callback && callback('error');
      }

      function onMediaDup(sha256, downloadUrl) {
        var callback = _mediaUploadRequests[sha256];
        _mediaUploadRequests[sha256] = undefined;
        callback && callback('duplicated', downloadUrl);
      }

      function onGroupMessageReceived(messageId, groupJID, senderJID, content,
                                      timestamp, wantsReceipt, senderName) {

        onMessageReceived(messageId, groupJID, content,
                          timestamp, wantsReceipt, senderName,
                          false, senderJID);
        methods.call('message_ack', [groupJID, messageId]);
      }

      function onMessageReceived(messageId, senderJID, content,
                                 timestamp, wantsReceipt, senderName,
                                 isBroadcast, authorJID) {
        fire('message', pub,
             newTextMessage(messageId, senderJID, content,
                            senderName, authorJID));
        methods.call('message_ack', [senderJID, messageId]);
        // TODO: The pub should be the client, we need to refactor this
        // module in order to provide the `singleton` module in a smarter way.
      }

      function onAudioReceived(messageId, senderJID, url, size,
                               receiptRequested, isBroadcast) {

        onMultiMediaReceived('audio', messageId, senderJID, undefined, url,
                             size, receiptRequested, isBroadcast);
      }

      function onGroupAudioReceived(messageId, groupJID, authorJID, url, size,
                                    receiptRequested) {

        onMultiMediaReceived('audio', messageId, groupJID, undefined, url,
                             size, receiptRequested, false, authorJID);
      }

      function onGroupMultiMediaReceived(type, messageId, groupJID, authorJID,
                                         preview, url, size, receiptRequested,
                                         isBroadcast) {

        onMultiMediaReceived(type, messageId, groupJID, preview, url, size,
                             receiptRequested, false, authorJID);
      }

      function onMultiMediaReceived(type, messageId, senderJID, preview, url,
                                    size, receiptRequested, isBroadcast,
                                    authorJID) {
        fire('message', pub,
             newMultiMediaMessage(type, messageId, senderJID,
                                  url, preview, authorJID));

        methods.call('message_ack', [senderJID, messageId]);
        // TODO: The pub should be the client, we need to refactor this
        // module in order to provide the `singleton` module in a smarter way.
      }

      function onLocationReceived(messageId, senderJID, name, preview,
                                  latitude, longitude,
                                  wantsReceipt, isBroadcast) {

        fire('message', pub,
             newLocationMessage(messageId, senderJID,
                                name, latitude, longitude));

        methods.call('message_ack', [senderJID, messageId]);
      }

      function onGroupLocationReceived(messageId, groupJID, authorJID, name,
                                       mediaPreview, mlatitude, mlongitude,
                                       wantsReceipt) {
        fire('message', pub,
             newLocationMessage(messageId, groupJID, name, mlatitude,
                                mlongitude, authorJID));
        methods.call('message_ack', [groupJID, messageId]);
      }

      function onContactTyping(senderJID) {
        fire('message', pub, newTypingMessage(senderJID, 'active'));
      }

      function onContactPaused(senderJID) {
        fire('message', pub, newTypingMessage(senderJID, 'idle'));
      }

      function newTypingMessage(senderJID, mode) {
        return {
          messageId: null,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: null
          },
          content: { state: mode },
          type: 'typing'
        };
      }

      function onContactAvailable(senderJID) {
        fire('message', pub, newAvailabilityMessage(senderJID, 'available'));
      }

      function onContactUnavailable(senderJID) {
        fire('message', pub, newAvailabilityMessage(senderJID, 'unavailable'));
      }

      function newAvailabilityMessage(senderJID, mode) {
        return {
          messageId: null,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: null
          },
          content: { state: mode },
          type: 'availability'
        };
      }

      function newTextMessage(messageId, senderJID, content, senderName,
                              authorJID) {
        return {
          messageId: messageId,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: senderName,
            authorMsisdn: !authorJID ? undefined : authorJID.split('@')[0]
          },
          content: content,
          type: 'text'
        };
      }

      function newMultiMediaMessage(type, messageId, senderJID,
                                    url, binaryData, authorJID) {
        return {
          messageId: messageId,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: '',
            authorMsisdn: !authorJID ? undefined : authorJID.split('@')[0]
          },
          content: {
            caption: '',
            uri: url,
            thumbSrc: binaryData ?
                      'data:image/jpeg;base64,' + binaryData :
                      getPlaceholder(type)
          },
          type: type
        };
      }

      function getPlaceholder(type) {
        return '/images/' + type + '_file.png';
      }

      // TODO: Rename name to address or caption. yowsup legacy
      function newLocationMessage(messageId, senderJID,
                                  name, latitude, longitude, authorJID) {
        return {
          messageId: messageId,
          sender: {
            msisdn: senderJID.split('@')[0],
            displayName: '',
            authorMsisdn: !authorJID ? undefined : authorJID.split('@')[0]
          },
          content: {
            coords: {
              latitude: latitude,
              longitude: longitude
            },
            address: name
          },
          type: 'location'
        };
      }

      var authenticating = false;

      var pub = {
        on: on,
        off: off,

        getAppVersion: function() {
          return appVersion;
        },

        get isOnline() {
          return methods.call('is_online', []);
        },

        get expirationDate() {
          return methods.call('getExpirationDate', []);
        },

        UPGRADE_URL: 'http://www.whatsapp.com/payments/cksum_pay.php?' +
                     'phone={{phone}}&cksum={{cksum}}',

        getUpgradeAccountURL: function (phone) {
          var token = phone + 'abc';
          var cksum = CoSeMe.crypto.MD5(token);
          var url = this.UPGRADE_URL.replace('{{phone}}', phone);
          url = url.replace('{{cksum}}', cksum);
          return url + '';
        },

        auth: function(userId, password, mcc, mnc, callback) {
          // Avoid authenticate while in the middle of another authentication
          if (authenticating) {
            console.log('Already authenticating. Aborting.');
            return false;
          }

          authenticating = true;
          fire('connecting');
          _authSuccessCallback = onSuccess;
          _authErrorCallback = onError;
          methods.call('auth_login', [userId, password, mcc, mnc]);

          var _this = this;
          function onSuccess() {
            authenticating = false;
            _userId = userId;
            _password = password;
            // TODO: Note this makes us available as soon as we log in
            _this.sendAvailable();
            callback(null);
          }

          function onError(reason) {
            authenticating = false;
            callback(reason || 'unexpected-error');
          }

          return true;
        },

        getProperty: function (name) {
          return properties[name] ? properties[name] : defaultProperties[name];
        },

        getAvailableProperties: function () {
          return Object.keys(properties || defaultProperties);
        },

        /* My presence */
        sendAvailable: function () {
          methods.call('presence_sendAvailable', []);
        },

        sendTyping: function (to, mode) {
          console.log('typing:' + mode);
          var jid = this.getJID(to);
          var methodName = 'typing_' + (mode === 'active' ? 'send' : 'paused');
          methods.call(methodName, [jid]);
        },

        register: function(countryCode, phoneNumber, locale, mcc, mnc, callback) {
          getSeed(function (err, seed) {
            if (err && err !== 'not-exist') {
              return callback(err);
            }

            seed = CoSeMe.registration
                     .getCode(countryCode, phoneNumber, onReady, onError,
                      seed, mcc, mnc, locale);

            if (err === 'not-exist') {
              saveSeed(seed);
            }
          });

          function onReady(response) {
            if (response.status !== 'fail') {
              callback(null, response);
            } else if (response.reason === 'too_recent') {
              callback('too_recent', response['retry_after']);
            } else {
              callback(-1, response); /* unknown error */
            }
          }
          function onError() {
            var statusCode = this.status || -1;
            callback(statusCode, null);
          }
        },

        validate:
        function(countryCode, phoneNumber, pin, screenName, callback) {
          getSeed(function (err, seed) {
            if (err) {
              return callback(err);
            }

            CoSeMe.registration
              .register(countryCode, phoneNumber, pin, onReady, onError, seed);
          });

          function onReady(response) {
            if (response.status !== 'fail') {
              callback(null, response);
            } else {
              callback(-1, response); /* unknown error */
            }
          }
          function onError() {
            callback(this.statusCode, null);
          }
        },

        updateProfile: function(profileData) {
          if (profileData.name) {
            methods.call('presence_sendAvailableForChat', [profileData.name]);
          }
          if (profileData.status) {
            methods.call('profile_setStatus', [profileData.status]);
          }
          if (profileData.photo) {
            this._setPicture('profile', profileData);
          }
        },

        _setPicture: function (type, photoSet, gid) {
          var methodName = type + '_setPicture';
          var firstArg = gid ? [this.getJID(gid)] : [];
          var photoReader = new FileReader();
          photoReader.onloadend = function () {
            var pictureData = photoReader.result;

            // No thumb image provided
            if (!photoSet.thumb) {
              methods.call(
                methodName,
                firstArg.concat([undefined, pictureData])
              );
            }

            // Thumb or preview provided
            else {
              photoReader = new FileReader();
              photoReader.onloadend = function () {
                var thumbData = photoReader.result;
                var id = methods.call(
                  methodName,
                  firstArg.concat([thumbData, pictureData])
                );

                // If error, retry without preview
                _setPictureRequests[id] = function (err) {
                  if (err) {
                    methods.call(
                      methodName,
                      firstArg.concat([undefined, pictureData])
                    );
                  }
                };
              };
              photoReader.readAsArrayBuffer(photoSet.thumb);
            }
          };
          photoReader.readAsArrayBuffer(photoSet.photo);
        },

        confirmContacts: function(numbers, callback) {

          CoSeMe.contacts.clearContacts();
          CoSeMe.contacts.addContacts(numbers);
          CoSeMe.contacts.query(onReady, onError);

          function onReady(response) {
            var err = null;
            if (!response || !response.c) {
              err = 'no-valid-response';
            }
            callback(err, response.c);
          }

          function onError(err) {
            callback(err);
          }
        },

        getContactsState: function(numbers, callback) {
          var jids = numbers.map(this.getJID.bind(this));
          var id = methods.call('contacts_getStatus', [jids]);
          _contactStatusRequests[id] = function (err, statusMap) {
            var phoneMap = {};
            for (var jid in statusMap) {
              if (statusMap.hasOwnProperty(jid)) {
                phoneMap[jid.split('@')[0]] = statusMap[jid];
              }
            }
            callback(null, phoneMap);
          };
        },

        subscribe: function (msisdn) {
          methods.call('presence_subscribe', [this.getJID(msisdn)]);
        },

        unsubscribe: function (msisdn) {
          methods.call('presence_unsubscribe', [this.getJID(msisdn)]);
        },

        getLastPresence: function (msisdn, callback) {
          var jid = this.getJID(msisdn);
          _presenceRequests[jid] = callback;
          methods.call('presence_request', [jid]);
        },

        /* Contact profile */
        getContactPicture: function (phone, callback) {
          var jid = this.getJID(phone);
          methods.call('contact_getProfilePicture', [jid]);
          _contactPictureRequests[jid] = callback;
        },

        // TODO: It seems to picture Id is not a unique identifier for the
        // current picture. Check another strategy.
        getContactPictureIfNew: function (phone, currentId, callback) {
          var _this = this;
          var jid = this.getJID(phone);
          methods.call('picture_getIds', [[jid]]);
          _contactPictureIdRequests[jid] = function _onId(serverId) {
            if (serverId === currentId) {
              console.log('ContactsPicture: equal');
              callback(null, serverId, null);
            }
            else {
              console.log('ContactsPicture: new');
              _this.getContactPicture(phone, callback);
            }
          };
        },

        /* Groups */
        getGroups: function (callback) {
          var id = methods.call('group_getParticipating');
          _participatingGroupsRequests[id] = callback;
        },

        createGroup: function (subject, callback) {
          var id = methods.call('group_create', [subject]);
          _groupCreateRequests[id] = function (err, gid) {
            if (!err) {
              gid = gid.split('@')[0];
            }
            callback && callback(err, gid);
          };
        },

        updateGroupProfile: function (gid, profileData) {
          var cosemeGid = this.getJID(gid);
          if (profileData.subject) {
            methods.call('group_setSubject', [cosemeGid, profileData.subject]);
          }
          if (profileData.photo) {
            this._setPicture('group', profileData, gid);
          }
        },

        addGroupParticipants: function (gid, participants, callback) {
          var _this = this;
          gid = this.getJID(gid);
          participants = participants.map(function (phone) {
            return _this.getJID(phone);
          });
          methods.call('group_addParticipants', [gid, participants]);
          callback && callback(null); // TODO: Listen for error when adding
                                      // participants.
        },

        removeGroupParticipants: function (gid, participants, callback) {
          var _this = this;
          gid = this.getJID(gid);
          participants = participants.map(function (phone) {
            return _this.getJID(phone);
          });
          methods.call('group_removeParticipants', [gid, participants]);
          callback && callback(null); // TODO: Listen for error when adding
                                      // participants.
        },

        leaveGroup: function (gid, callback) {
          gid = this.getJID(gid);
          methods.call('group_end', [gid]);
          callback && callback(null);
        },

        getGroupSubject: function(gid, callback) {

          var jid = this.getJID(gid);
          methods.call('group_getInfo', [jid]);

          _groupInfoRequests[jid] = function _onInfo(subject) {
            callback && callback(null, subject);
          };
        },

        getGroupParticipants: function(gid, callback) {

          var jid = this.getJID(gid);
          methods.call('group_getParticipants', [jid]);

          _groupParticipantRequests[jid] = function _onParticipants(list) {
            callback && callback(null, list);
          };
        },

        /* Messaging */
        sendMessage: function(options) {
          var jid = this.getJID(options.destination);
          var content = options.content;
          return methods.call('message_send', [jid, content]);
        },

        sendImage: function(options) {
          var type = options.type;
          var jid = this.getJID(options.destination);
          var url = options.url;
          var name = options.name;
          var size = options.size;
          var thumbnail = options.thumbnail;

          var methodName = 'message_' + type + 'Send';
          return methods.call(methodName, [jid, url, name, size, thumbnail]);
        },

        sendLocation: function(options) {
          var jid = this.getJID(options.destination);
          var latitude = options.latitude;
          var longitude = options.longitude;
          return methods.call('message_locationSend',
            [jid, latitude, longitude]);
          // TODO: It must be possible to send the address as well
        },

        /* Uploading media */
        upload: function(blob, type, destination, callback) {
          var jid = this.getJID(destination);
          var blobReader = new FileReader();
          var sizeToHash = 1024 * 1024; // 1M
          var blobToHash = blob.slice(0, Math.min(sizeToHash, blob.size));

          blobReader.onloadend = requestURL;
          blobReader.readAsArrayBuffer(blobToHash);

          function requestURL() {
            var crypto = CoSeMe.crypto;
            var ByteArrayWA = CoSeMe.utils.ByteArrayWA;
            var binaryData = blobReader.result;
            var words = binaryData.byteLength >>> 2; // truncate to 32
                                                     // multiple
            var buffer = new Uint32Array(binaryData, 0, words);
            var wordBuffer = new ByteArrayWA(buffer, words << 2);
            // XXX: We are not calculating a complete SHA256 of the file
            // but of a chunk to release the CPU and avoid breaking the app.
            // This should be done by making the hash function asynchronous.
            var sha256 =
              crypto.SHA256_IP(wordBuffer.array).toString(crypto.enc.Base64);
            _mediaUploadRequests[sha256] = uploadMedia;
            methods.call('media_requestUpload', [sha256, type, blob.size]);
          }

          function uploadMedia(error, url) {

            if (error) {
              return onError(error);
            }

            if (error === 'duplicated') {
              return onSuccess(url);
            }

            // XXX: The last parameter is used internally to limit the amount
            // of file to be read in order to compute the internal MD5 hash
            // required. Same reasons as above. We should change the
            // implementation in order to make MD5 asynchronous.
            CoSeMe.media.upload(
              jid, blob, url, onSuccess, onError, onProgress, sizeToHash);
          }

          function onSuccess(location) {
            callback(null, 'complete', { location: location });
          }

          function onProgress(percentageDone) {
            callback(null, 'progress', { progress: percentageDone });
          }

          function onError(err) {
            callback(err, 'error');
          }
        },

        /* Download media */
        download: function(url, callback) {
          CoSeMe.media.download(url, onSuccess, onError, onProgress);

          function onSuccess(blob) {
            callback(null, 'complete', { blob: blob });
          }

          function onProgress(percentageDone) {
            callback(null, 'progress', { progress: percentageDone });
          }

          function onError(err) {
            callback(err, 'error');
          }
        },

        getJID: function(destination) {
          var isGroup = destination.indexOf('-') >= 0;
          return destination + '@' + (isGroup ? CoSeMe.config.groupDomain :
                                                CoSeMe.config.domain);
        }
      };
      return pub;
    }
  };
}));
