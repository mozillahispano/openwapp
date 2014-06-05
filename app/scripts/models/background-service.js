define(['backbone', 'global'], function (Backbone, global) {
  'use strict';

  var alarms = window.navigator.mozAlarms;
  if (!alarms) {
    console.log('No alarms API available.');
  }

  var BackgroundService = Backbone.Model.extend({

    alarmHandlerInstalled: false,

    intervalId: null,

    defaults: function () {
      var awakePeriod = localStorage.getItem('awakePeriod') !== null ?
                        parseInt(localStorage.getItem('awakePeriod'), 10) :
                        5 * 60 * 1000; // 5 min
      return {
        awakePeriod: awakePeriod
      };
    },

    start: function () {
      if (!alarms) { return; }
      console.log('[background service] Started');
      this._installAlarmHandler();
      this._resetAlarm();
      this.on('change:awakePeriod', this._changePeriod);
    },

    stop: function () {
      if (!alarms || !this.intervalId) { return; }
      console.log('[background service] Stopped');
      this._cancelAlarm();
    },

    _changePeriod: function () {
      this._resetAlarm();
      localStorage.awakePeriod = this.get('awakePeriod');
    },

    _installAlarmHandler: function () {
      if (this.alarmHandlerInstalled) { return; }
      navigator.mozSetMessageHandler('alarm', function _onAwake() {
        console.log('[background service] Awake signal received.');

        // Reconnect
        if (!global.client.isOnline) {
          console.log('[background service] Service down, reconnecting!');
          global.auth.checkCredentials();
        }

        // Send report of new messages
        global.notifications.sendReport();

        this._resetAlarm();
      }.bind(this));
      this.alarmHandlerInstalled = true;
    },

    _resetAlarm: function () {
      this._cancelAlarm();
      this._setNextAlarm();
    },

    _cancelAlarm: function () {
      var alarmId = parseInt(localStorage.alarmId, 10);
      if (alarmId) {
        alarms.remove(alarmId);
      }
    },

    _setNextAlarm: function () {
      var awakePeriod = this.get('awakePeriod');
      if (!awakePeriod) {
        console.log('[background service] Auto awake disabled!');
        return;
      }

      var nextAlarm = new Date(Date.now() + awakePeriod);
      var alarmRequest = alarms.add(nextAlarm, 'ignoreTimezone');
      alarmRequest.onsuccess = function () {
        var alarmId = alarmRequest.result;
        localStorage.alarmId = alarmId;
        console.log(
          '[background service] Next awake signal with id',
          alarmId, 'by', nextAlarm.toString()
        );
      };
      alarmRequest.onerror = function () {
        console.error('Impossible to set an alarm to keep the program alive.');
      };
    }
  });

  return BackgroundService;
});
