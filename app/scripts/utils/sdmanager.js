define([
  'underscore',
  'backbone'
],
function (_, Backbone) {
  'use strict';

  var STORAGE_TYPE = 'sdcard';

  function isDeviceStorageAvailable() {
    return !!(navigator.getDeviceStorage &&
      navigator.getDeviceStorage(STORAGE_TYPE));
  }

  function SDManager() {
    var _this = this;
    this.status = null;

    function initDeviceStorage() {
      var storage = navigator.getDeviceStorage(STORAGE_TYPE);

      var request = storage.available();
      request.onsuccess = function (e) {
        _this._setStatus(e.target.result);
      };
      request.onerror = function () {
        _this._setStatus('unmounted');
      };
      return storage;
    }

    _.extend(this, Backbone.Events);

    if (isDeviceStorageAvailable()) {
      this.storage = initDeviceStorage();
    }
    else {
      this.storage = null;
      // TODO: setup our mock or something else
    }
  }

  SDManager.prototype.isReady = function () {
    return this.status === 'available' && this.storage !== null;
  };

  SDManager.prototype.getPath = function (filename) {
    return 'openwapp/' + filename;
  };

  SDManager.prototype.save = function (filename, blob, callbacks) {
    var _this = this;

    function addFile() {
      var request = _this.storage.addNamed(blob, _this.getPath(filename));
      request.onsuccess = function () {
        console.log('sdcard SAVE SUCCESS', filename);
        if (callbacks.success) { callbacks.success(); }
      };
      request.onerror = function () {
        var err = {code: 'not_saved', details: this.error};
        console.log('sdcard SAVE ERROR', filename);
        if (callbacks.error) { callbacks.error(err); }
      };
    }

    callbacks = callbacks || {};
    if (this.isReady()) {
      /*jslint es5: true */
      var deletereq = this.storage.delete(this.getPath(filename));
      /*jslint es5: false */
      deletereq.onerror = deletereq.onsuccess = addFile;
      console.log('sdcard SAVE', filename);
    }
    else {
      if (callbacks.error) { callbacks.error({code: 'not_ready'}); }
    }
  };

  // TODO: This follows node.js callback style, save not but the rest of the
  // application does. As we don't use save no more, it should be convenient
  // to refactor the callback styel of save() method.
  SDManager.prototype.load = function (filename, callback) {
    var getRequest = this.storage.get(filename);
    getRequest.onerror = function () {
      callback({ code: 'not-found', details: this.error });
    };
    getRequest.onsuccess = function () {
      callback(null, getRequest.result);
    };
  };

  SDManager.prototype._setStatus = function (status) {
    if (status !== this.status) {
      this.status = status;
      this.trigger('change', this.status);
    }
  };

  return SDManager;
});
