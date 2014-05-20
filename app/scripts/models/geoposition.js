define([
  'backbone'
], function (Backbone) {
  'use strict';

  var GeoPosition = Backbone.Model.extend({
    defaults: function () {
      return {
        latitude: null,
        longitude: null
      };
    },

    update: function (maxTime) {
      var _this = this;
      navigator.geolocation.getCurrentPosition(
        function (position) {
          console.log('**** geolocation OK');
          console.log('**** latitude: ' + position.coords.latitude);
          console.log('**** longitude: ' + position.coords.longitude);
          _this.set({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          _this.trigger('success', position);
        },
        function (error) {
          _this.trigger('error', error);
        },
        {
          timeout: maxTime
        }
      );
    }
  });

  return GeoPosition;
});
