define([
  'backbone'
], function (Backbone) {
  'use strict';

  var Notification = Backbone.Model.extend({
    _referencesArray: [],
    app: null,

    send: function (title, body) {
      if (!('mozNotification' in navigator)) {
        console.log('Notification disabled');
        return;
      }

      var _this = this;

      if (document.mozHidden) { // If app run in background
        navigator.mozApps.getSelf().onsuccess = function gotSelf(evt) {
          _this.app = evt.target.result;
          _this.createNotification(title, body);
        };
      }
    },

    createNotification: function (title, body) {
      var _this = this;
      var icon = _this.getIconURI(_this.app);

      var notification = navigator.mozNotification.createNotification(title,
                                                                    body,
                                                                    icon);

      notification.onclick = function () {
        _this.app.launch();
        // TODO: to open the app in the conversation
        //  window.location.hash = '#conversation/' + phone;
      };

      notification.show();
    },

    /**
     * Return the URI of the icon
     */
    getIconURI: function (app, entryPoint) {
      var icons = app.manifest.icons;

      if (entryPoint) {
        /*jshint camelcase: false */
        icons = app.manifest.entry_points[entryPoint].icons;
        /*jshint camelcase: true */
      }

      if (!icons) {
        return null;
      }

      var sizes = Object.keys(icons).map(function parse(str) {
        return parseInt(str, 10);
      });
      sizes.sort(function (x, y) { return y - x; });

      var HVGA = document.documentElement.clientWidth < 480;
      var index = sizes[HVGA ? sizes.length - 1 : 0];
      return app.installOrigin + icons[index];
    }

  });

  return Notification;
});
