/* global MozActivity */
define([
  'underscore',
  'backbone',
  'zeptojs',
  'global',
  'models/message',
  'templates'
], function (_, Backbone, $, global, Message, templates) {
  'use strict';

  return Backbone.View.extend({
    el: '#main-page',

    template: templates['location-viewer'],

    model: Message,

    events: {
      'click img' : 'openGoogleMaps'
    },

    initialize: function (options) {
      this.conversation = options.conversation;
      this.scrollTop = options.scrollTop;
    },

    clear: function () {
      this.stopListening();
    },

    render: function () {
      var data = _.extend(this.model.toJSON(), {
        headerText: this.model.get('contents').address ?
                    this.model.get('contents').address : '',
        scrollTop: this.scrollTop
      });
      this.$el.html(this.template(data));

      this.renderLocation();
    },

    renderLocation: function () {
      var latitude = this.model.get('contents').coords.latitude;
      var longitude = this.model.get('contents').coords.longitude;

      var maxWidth = this.$el.find('.page-wrapper').width();
      var maxHeight = this.$el.find('.page-wrapper').height();

      var img = $('<img />');
      this.$el.find('.viewer').append(img);

      var url = [
        'http://m.nok.it/?c=' + latitude + ',' + longitude,
        '&h=' + maxHeight + '&w=' + maxWidth + '&z=15&r=10&nord',
        '&app_code=' + global.mapsAppCode,
        '&app_id=' + global.mapsAppId
      ].join('');

      img.attr('src', url);
      this.$el.find('.viewer').removeClass('image');
      this.$el.find('.viewer').height(maxHeight).width(maxWidth).show();
      this.$el.find('.loading').hide();
    },

    openGoogleMaps: function () {
      var latitude = this.model.get('contents').coords.latitude;
      var longitude = this.model.get('contents').coords.longitude;
      var address = this.model.get('contents').address;

      var mapsUrl = [
        'http://m.here.com/#action=search&params={"latitude":' + latitude +
        ',"longitude":' + longitude + ',"address": "' + address + '"}&bmk=1'
      ].join('');

      console.log('opening map', mapsUrl);

      new MozActivity({
        name: 'view',
        data: {
          type: 'url',
          url: mapsUrl
        }
      });
    }
  });
});
