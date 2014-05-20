define([
  'backbone'
], function (Backbone) {
  'use strict';

  var Connectivity = Backbone.Model.extend({
    defaults: function () {
      return {
        online: navigator.onLine
      };
    },

    initialize: function () {
      var _this = this;
      window.addEventListener('online', function () {
        console.log('navigator has gone online');
        _this.set({ online: true });
      });

      window.addEventListener('offline', function () {
        console.log('navigator has gone offline');
        _this.set({ online: false });
      });
    }
  });

  return new Connectivity();
});
