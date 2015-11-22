define([
  'underscore',
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates',
  'utils/connectivity'
], function (_, Backbone, $, global, Message, templates, connectivity) {
  'use strict';

  return Backbone.View.extend({
    el: '#main-page',

    template: templates['compose-location'],

    model: new Message(),

    events: {
      'click form button':    'backToConversation',
      'click section button': '_createLocationMessage'
    },

    initialize: function (options) {
      this.conversation = options.conversation;
      this.listenTo(global.geoPosition, 'success', this.showLocation);
      this.listenTo(global.geoPosition, 'error', this.showError);
    },

    clear: function () {
      this.stopListening();
      if (this.imageURL) { window.URL.revokeObjectURL(this.imageURL); }
    },

    render: function () {
      this.$el.html(
        this.template({conversationId: this.conversation.get('id')})
      );

      //if user is offline, show error
      if (!connectivity.get('online')) {
        console.log('User offline. Geolocation message aborted');
        this.showError();
        return;
      }

      this.gettingLocation = true;
      global.geoPosition.update(global.gpsTimeout);

    },

    backToConversation: function () {
      global.router.navigate('conversation/' + this.conversation.get('id'),
        { trigger: true });
    },

    showError: function () {
      console.log('unable to get current location, aborting...');
      this.gettingLocation = false;
      this.$el.find('form section').addClass('error');
      this.$el.find('form button').html(
        navigator.mozL10n.get('acceptButton'));
    },

    showLocation: function () {
      // If some other view called geoposition we ignore it
      if (!this.gettingLocation) {
        return;
      }

      this.gettingLocation = false;

      this.$el.find('form').hide();
      var latitude = global.geoPosition.get('latitude');
      var longitude = global.geoPosition.get('longitude');
      var maxWidth = this.$el.find('.page-wrapper').width();
      var maxHeight = this.$el.find('.page-wrapper').height();

      var img = this.$el.find('.viewer img');

      var url = [
        'http://m.nok.it/?c=' + latitude + ',' + longitude,
        '&h=' + maxHeight + '&w=' + maxWidth + '&z=15&r=10&nord',
        '&app_code=' + global.mapsAppCode,
        '&app_id=' + global.mapsAppId
      ].join('');

      img.attr('src', url);
      this.$el.find('#location-sender').height(maxHeight).width(maxWidth)
      .show();
    },

    _createLocationMessage: function (event) {
      if (event) { event.preventDefault(); }

      var message = new Message({
        type: 'location',
        contents: {
          coords: {
            latitude: global.geoPosition.get('latitude'),
            longitude: global.geoPosition.get('longitude')
          },
          address: navigator.mozL10n.get('currentLocation')
        },
        from: {msisdn: global.auth.get('msisdn')},
        meta: {date: new Date()}
      });

      this.model = message;

      this.backToConversation();
      //add message to conversation model
      this.conversation.get('messages').push(this.model);

      this.sendMessage();

    },

    sendMessage: function () {
      var _this = this;
      var message = _this.model;
      global.rtc.sendLocation(
        {
          to: message.get('conversationId'),
          id: message.cid,
          latitude: message.get('contents').coords.latitude,
          longitude: message.get('contents').coords.longitude,
          address: message.get('contents').address
          // TODO: Add a preview
        },
        function (error, commId) {
          _this._handleSentMessage(message, error, commId);
        }
      );
    },

    _handleSentMessage: function (message, error, commId) {
      if (error) { // error sending message
        message.set('status', 'unsent');
      }
      else { // message was sent successfully
        var meta = message.get('meta') || {};
        meta.commId = commId.value;
        message.set({
          status: 'sent',
          meta: meta
        });
      }

      message.saveToStorage();
    }

  });
});
