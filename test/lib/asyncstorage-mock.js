define([
  'underscore',
  'vendor/async-storage/async-storage'
], function (_, AsyncStorage) {
  'use strict';

  // Mock for AsyncStorage library
  //
  // replaces it with an in-memory storage.
  //
  // Uses sinon to create/restore mocks.
  //
  // setFakeStorage(): activate it.
  // releaseFakeStorage(): deactivate it after having activated.
  //

  var asyncStorageMock = {};

  asyncStorageMock.stubs = [];

  asyncStorageMock.setFakeStorage = function () {

    asyncStorageMock.simulatedStorage = {}; // where data is actually stored

    asyncStorageMock.stubs.push(sinon.stub(AsyncStorage, 'getItem',
      function (key, callback) {
      callback(asyncStorageMock.simulatedStorage[key]);
    }));

    asyncStorageMock.stubs.push(sinon.stub(AsyncStorage, 'setItem',
      function (key, attributes, callback) {
      asyncStorageMock.simulatedStorage[key] = _.clone(attributes);
      if (callback) { callback(); }
    }));

    asyncStorageMock.stubs.push(sinon.stub(AsyncStorage, 'removeItem',
      function (key, callback) {
      delete asyncStorageMock.simulatedStorage[key];
      if (callback) { callback(); }
    }));

    asyncStorageMock.stubs.push(sinon.stub(AsyncStorage, 'length',
      function (callback) {
      var size = 0, key;
      for (key in asyncStorageMock.simulatedStorage) {
        if (asyncStorageMock.simulatedStorage.hasOwnProperty(key)) { size++; }
      }
      if (callback) { callback(size); }
    }));

    asyncStorageMock.stubs.push(sinon.stub(AsyncStorage, 'clear',
      function (callback) {
      asyncStorageMock.simulatedStorage = {};
      if (callback) { callback(); }
    }));
  };

  asyncStorageMock.releaseFakeStorage = function () {
    asyncStorageMock.stubs.forEach(function (stub) {
      stub.restore();
    });
    asyncStorageMock.stubs = [];
  };

  return asyncStorageMock;
});