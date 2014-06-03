// # RTC model
// This model is responsible of creating and mantaining the RTC connection to
// the SIP server, and trigger the appropiate events from the server.
//
// ## Properties
//
// * `status`: The status of the SIP connection. Can be can be 'online',
//   'offline' and 'connecting'.
//
// ## Methods
// * `initialize()`: the constructor only initializes the OTTCOMMS library
//   and starts listening to its events
//
// * `register(user, password)`: Logs into the SIP server. It changes the status
//   to `connecting` until the connection is established (then it goes to
//   `online`).
//
// * `close()`: Closes the connection to the SIP server and sets the status
//   to `offline`.
//
// * `subscribe()`: Asks for user's contacts presence info to the SIP server.
//
// * `sendMessage(options{id, to, message}, callback{err, commId})`:
//   Sends a text message to the specified destination. If there is an error,
//   `err` will contain the SIP error code.
//
// * `sendImage(options{id, to, caption, storageUrl, thumbnail},
//    callback{err, commId})`: Sends an image to the specified destination. If
//    there is an error, `err` will contain the SIP error code.
//
// ## Events
//
// ### Inbound events
//
// **global.auth change:loggedIn**: executes `register()` or `close()`
// depending on the loggedIn value
//
// **ottcomms connected**: executes `subscribe()` and sets status to `online`
//
// **ottcomms disconnected**: sets status to `offline`
//
// **ottcomms subscribe**: triggers `subscribe` event
//
// **ottcomms message**: triggers `message` and `message:<type>` events
//
// ### Outbound events
//
// **change:status**: when the status of the connection with the SIP server
// changes
//
// **subscribe (contacts)**: when the SIP server sends updated info about
// contacts presence. contacts format:
//     [ { id (phone number), status ("online" or "offline") } ]
//
// **message** (from, meta, message): when receiving any type of message.
// Format of from and meta params:
//     { from: { msisdn, displayName }, meta: { type, date, commId} }
//
// **message:text (from, meta, message)**: text message received.
//
// **message:location (from, meta, location)**: location received. Location
// format:
//     { coords: {lat, long}, address }
//
// **message:image (from, meta, image)**: image received. Image
// following format:
//     { caption, uri, thumbSrc }
//
// **message:audio (from, meta, audio)**: audio received. audio has the
// following format:
//     { uri, duration, mimeType }
//
// **status (from, status)**: message status received. Status has the
// following format:
//     { commId, status ("delivered" or "displayed") }
//
// **typing:active (from, typing)**: typing event received. typing has the
// following format:
//     { state: "active" }
//
// **typing:idle (from, typing)**: typing event received. typing has the
// following format:
//     { state: "idle" }


define([
  'backbone',
  'zeptojs',
  'global',
  'vendor/coseme-client/client'
], function (Backbone, $, global, Client) {
  'use strict';

  // In seconds
  var SEND_MESSAGES_TIMEOUT = 60;

  var Rtc = Backbone.Model.extend({
    defaults: function () {
      return {
        // Status can be 'online', 'offline' and 'connecting'
        status: 'offline',
        headers: {},
        _sentMessages: {}
      };
    },

    initialize: function () {
      var _this = this;

      // Initialize RTC client
      this.client = Client.init();

      // Bindings to OttComms-RTC events

      this.listenTo(this.client, 'connected', function () {
        _this.set('status', 'online');
      });

      this.listenTo(this.client, 'disconnected', function () {
        _this.set('status', 'offline');
      });

      this.listenTo(this.client, 'connecting', function () {
        _this.set('status', 'connecting');
      });

      // TODO: Remember, this is a generic message, it was triggered when
      // receiving any kind of message. We should distinguish by cases
      // or make client to always trigger a message providing from, type and
      // content according to nature of the message and _parse() method for
      // content.
      this.listenTo(this.client, 'message', this._onMessage);
      this.listenTo(this.client, 'notification', this._onNotification);

      this.listenTo(global.geoPosition, 'change', this._syncGeoposition);
      this._syncGeoposition(global.geoPosition);

      // commId has collapsed with messageId
      this.listenTo(this.client, 'messageSent', function (messageId) {
        var callback = _this.get('_sentMessages')[messageId];
        if (callback) {
          delete _this.get('_sentMessages')[messageId];
          callback(null, messageId);
        }
      });

      this.listenTo(this.client, 'messageDelivered', function (from, commId) {
        _this.trigger('delivered', from, commId);
      });
    },

    _onMessage: function (client, message) {
      var from = message.sender;
      var type = message.type;
      var content = message.content;
      // TODO: Translate _parse (see at the bottom) to client

      // Split typing and availability events into two different events
      if (type === 'typing' || type === 'availability') {
        type = type + ':' + content.state;
      }

      var contentTypes = ['location', 'audio', 'video', 'image', 'text'];
      if (contentTypes.indexOf(type) !== -1) {
        // Get metadata of the message
        var meta = this._getMessageMeta(message);
        meta.type = type;

        this.trigger('message message:' + type, from, meta, content);
        this.trigger('typing:idle', from, { state: 'idle' });
      } else {
        this.trigger(type, from, content);
      }
    },

    _onNotification: function (client, notification) {
      var from = notification.sender;
      var type = notification.type;
      var content = notification.content;

      var meta = this._getMessageMeta(notification);
      meta.type = type;
      this.trigger('notification notification:' + type, from, meta, content);
    },

    logout: function () {
      // TODO: Reimplement with the new client
    },

    close: function () {
      this.logout();
      this.stopListening();
      this.set('_sentMessages', {});
    },

    sendMessage: function (options, callback) {
      if (!this._checkOnline(callback)) { return; }

      // TODO: Ensure sendMessage() return an always distinct id
      var messageId = this.client.sendMessage({
        content: options.message,
        destination: options.to
      });

      this._addSentMessage(messageId, callback);
    },

    subscribe: function (msisdn) {
      this.client.subscribe(msisdn);
    },

    unsubscribe: function (msisdn) {
      this.client.unsubscribe(msisdn);
    },

    getLastSeen: function (msisdn, callback) {
      this.client.getLastPresence(msisdn, callback);
    },

    _checkOnline: function (callback) {
      if (this.get('status') !== 'online') {
        if (callback && typeof callback === 'function') {
          setTimeout(function () {
            callback(408);
          }, 1000);
          return false;
        }
      }
      return true;
    },

    sendImage: function (options, callback) {
      var messageId = this.client.sendImage({
        type: options.type,
        destination: options.to,
        url: options.storageUrl,
        name: options.caption,
        size: options.blobSize,
        thumbnail: options.thumbnail
      });

      this._addSentMessage(messageId, callback);
    },

    sendLocation: function (options, callback) {
      //check first if user is online
      if (!this._checkOnline(callback)) { return; }

      var messageId = this.client.sendLocation({
        destination: options.to,
        latitude: options.latitude,
        longitude: options.longitude,
        address: options.address
      });

      this._addSentMessage(messageId, callback);
    },

    _addSentMessage: function (messageId, callback) {
      var _this = this;

      if (typeof callback === 'function') {
        // Store callback to be called when we receive the response
        this.get('_sentMessages')[messageId] = callback;

        // Add a time
        setTimeout(function () {
          if (_this.get('_sentMessages')[messageId]) {
            delete _this.get('_sentMessages')[messageId];
            callback(408);
          }
        }, SEND_MESSAGES_TIMEOUT * 1000);
      }
    },

    _syncGeoposition: function (model) {
      var latitude = model.get('latitude');
      var longitude = model.get('longitude');
      if (latitude !== null && typeof latitude !== 'undefined') {
        this.get('headers').GeoPosition = latitude + ' ' + longitude;
      }
    },

    _getMessageType: function (message) {
      if (message.headers['comm-type']) {
        return message.headers['comm-type'];
      } else if (message.headers['content-type'] ===
        'application/jj-comm-notification+xml') {
        return 'status';
      } else if (message.headers['content-type'] ===
        'application/im-iscomposing+xml') {
        return 'typing';
      }
    },

    _getMessageMeta: function (message) {
      return {
        date: new Date(),
        commId: message.messageId
      };
    },

    typing: function (to, state) {
      this.client.sendTyping(to, state);
    },

    _parse: {
      status: function (message) {
        var content = (new DOMParser()).parseFromString(
          message.content, 'application/xml'
        );
        return {
          commId: content.querySelector('comm-id').textContent,
          status: content.querySelector('status *').nodeName.toLowerCase()
        };
      },
      image: function (message) {
        // Using DOMParser, because Zepto parses it as HTML and caption
        // tag is not recognized correctly
        var content = (new DOMParser()).parseFromString(
          message.content, 'application/xml'
        );
        return {
          caption: content.querySelector('caption').textContent,
          uri: content.querySelector('uri').textContent,
          thumbSrc: 'data:' + content.querySelector('mime-type').textContent +
            ';base64,' + content.querySelector('thumbnail').textContent
        };
      },
      audio: function (message) {
        var content = $(message.content);
        return {
          uri: content.find('uri').text(),
          duration: content.find('duration').text(),
          mimeType: content.find('mime-type').text()
        };
      }
    }
  });

  return Rtc;
});
