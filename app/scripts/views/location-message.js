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

    template: templates['location-message'],

    model: Message,

    events: {
    },

    initialize: function () {
      this.listenTo(this.model, 'change:status', this._changeStatus);
    },

    clear: function () {
      this.stopListening();
    },

    render: function () {
      var data = _.extend(this.model.toJSON(), {
        locationText: this.model.get('contents').address ?
                      this.model.get('contents').address : ''
      });
      data.meta.timestamp = data.meta.date.getTime();
      var newElement = this.template(data);
      this.setElement(newElement);

      var latitude = this.model.get('contents').coords.latitude;
      var longitude = this.model.get('contents').coords.longitude;

      var img = this.$el.find('a img');
      img.css('visibility', 'hidden');

      var url = [
        'http://m.nok.it/?c=' + latitude + ',' + longitude,
        '&h=100&w=150&z=15&r=10&nord',
        '&app_code=' + global.mapsAppCode,
        '&app_id=' + global.mapsAppId
      ].join('');


      img.attr('src', url);
      img.on('load', function () {
        img.css('visibility', 'visible');
      });
    },

    _changeStatus: function () {
      var oldElement = this.$el;
      this.render();
      oldElement.replaceWith(this.$el);
    }
  });
});
