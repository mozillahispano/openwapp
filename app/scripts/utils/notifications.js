define([
  'backbone',
  'global'
], function (Backbone, global) {
  'use strict';

  var Notification = Backbone.Model.extend({

    app: null,

    _queue: [],

    send: function (title, body) {
      var notification = { title: title, body: body };
      if (document.mozHidden) {
        this._enqueue(notification);
      }
      else {
        this.fire('notification', notification);
      }
    },

    _enqueue: function (notification) {
      this._queue.push(notification);
    },

    sendNow: function () {
      if (!('mozNotification' in navigator)) {
        console.log('Notification disabled');
        return;
      }

      var pendingNotifications = this._queue.length;
      if (pendingNotifications === 0) {
        return;
      }

      // One notification pending, send just that
      var title = this._queue[0].title;
      var body = this._queue[0].body;

      // More than one, make a report
      if (pendingNotifications > 1) {
        var interpolate = global.l10nUtils.interpolate;
        var l10n = global.localisation[global.language];
        var titleId = 'notificationReportTitle';
        var bodyId = 'notificationReportBody';
        var titleMsg = l10n[titleId];
        var bodyMsg = l10n[bodyId];

        title = interpolate(titleMsg, { count: pendingNotifications });
        body = interpolate(bodyMsg, { names: this._queue.map(function (item) {
          return item.title;
        }) });
      }

      this._queue.splice(0, pendingNotifications);

      var _this = this;
      navigator.mozApps.getSelf().onsuccess = function gotSelf(evt) {
        _this.app = evt.target.result;
        _this.createNotification(title, body);
      };

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
