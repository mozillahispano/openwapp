define([
  'underscore',
  'storage/dbmanager'
], function (_, dbManager) {
  'use strict';

  var indexedDBMock = {};

  // -------------------------------------------------------------------
  // IndexedDB Mock
  // -------------------------------------------------------------------
  //
  // Simulates an IndexedDB backend with different settable behaviours.
  // - setFakeStorage
  //      Activates it overriding dbManager's reference to indexed-db,
  //      and saving it.
  //
  // - releaseFakeStorage
  //      Disables it by restoring the previously saved reference.
  //
  // - setFailAfter(n)
  //      Makes the nth operation to fail. Use to simulate problems.
  //

  // Use this when you want to test something without actually storing it
  indexedDBMock.setFakeStorage = function () {

    if (typeof dbManager._savedIndexedDB !== 'undefined') {
      console.error('Attempt to set fake storage twice');
      return;
    }

    // Fake indexedDB
    dbManager._savedIndexedDB = dbManager._indexedDB;
    dbManager._indexedDB = {};

    // Actual storage
    //
    // fakeStorage is structured this way
    //   fakeStorage['store1'] = [ obj1, obj2, ... ]
    //
    var fakeStorage = {};

    // Helper function to simulate database failures
    dbManager._indexedDB.failCount = undefined;
    var shouldFail = function () {
      if (typeof dbManager._indexedDB.failCount !== 'undefined') {
        if (!dbManager._indexedDB.failCount) {
          return true;
        }
        dbManager._indexedDB.failCount--;
      }
      return false;
    };

    // Mocked 'delete' database
    //
    dbManager._indexedDB.deleteDatabase = function (dbname) {
      var request = {};
      request.dbname = dbname;
      var _this = this;
      setTimeout(function () {
        if (shouldFail() || !_this.db || !_this.db.isOpen) {
          request.onerror('NOT_ALLOWED_ERR');
          return;
        }
        fakeStorage = {}; // remove all
        request.onsuccess();
      }, 0);
      return request;
    };

    dbManager._indexedDB.db = null;

    // Mocked 'open' database
    //
    dbManager._indexedDB.open = function (dbname, dbversion) {

      var openrequest = {};
      if (fakeStorage._db) {
        // Already exists, return it
        console.log('Mock db already created', dbname, dbversion);
        setTimeout(function () {
          openrequest.onsuccess(
            { target : { result : fakeStorage._db }});
        }, 0);
        return openrequest;
      }

      console.log('Creating new database', dbname, dbversion);
      fakeStorage._db = {
        isOpen : false
      };

      var db = fakeStorage._db;

      // Mocked close method
      db.close = function () {
        db.isOpen = false;
      };

      // Mocked create object store
      db.createObjectStore = function (name, args) {
        var objStore = {};
        fakeStorage[name] = objStore;
        objStore.createdIndexes = {};
        objStore.keyPath = args.keyPath;
        objStore.data = [];
        if (args.autoIncrement) {
          objStore.autoIncrement = true;
          objStore.lastKeyGenerated = 0;
        }

        objStore.createIndex = function (name, keys, flags) {
          var index = {};
          index.keys = keys;
          index.flags = flags;
          objStore.createdIndexes[name] = index;
          console.log('Mock index created ', name, keys, flags);
        };

        console.log('Mock store created ', name, args);
        return objStore;
      };

      //  helper
      var valueInRange = function (keyval, range) {
        if (!range) {
          return true;
        }
        // TODO: will not with composite keyPaths
        return (((range.openLower && keyval > range.lower) ||
                (!range.openLower && keyval >= range.lower)) &&
               ((range.openUpper && keyval < range.upper) ||
                (!range.openUpper && keyval <= range.upper)));
      };

      // Mocked create transaction
      //
      db.transaction = function (stores, type) {

        if (shouldFail()) {
          throw window.DOMException.constructor(
            window.DOMException.INVALID_STATE_ERR, 'Error Message');
        }

        var txn = {};
        txn.type = type;
        txn._isAborted = false;

        // Mocked Abort transaction
        //
        txn.abort = function () {
          txn._isAborted = true;
        };

        // Mocked create Store
        //
        txn.objectStore = function (storeName) {
          if (shouldFail()) {
            throw window.DOMException.constructor(
              window.DOMException.INVALID_STATE_ERR, 'Error Message');
          }
          // if (!fakeStorage[storeName]) {
          //   fakeStorage[storeName] = [];
          // }
          var store = fakeStorage[storeName];
          if (!store) {
            console.log('Attempted to access unknown store', storeName);
            // throw window.DOMException.constructor(
            //   window.DOMException.INVALID_STATE_ERR, 'Unknown ' + storeName);
          }

          // Mocked put in store
          //
          store.put = function (object) {
            var request = {};
            setTimeout(function () {
              if (txn._isAborted || shouldFail()) {
                request.onerror('ABORT_ERR');
                return;
              }

              if (!db.isOpen) {
                request.onerror('NOT_ALLOWED_ERR');
                return;
              }

              if (type === 'readonly') {
                request.onerror('READ_ONLY_ERR');
              } else if (type === 'readwrite') {
                // Auto generate
                object = _.clone(object); // like indexeddb does
                if (store.autoIncrement && !object[store.keyPath]) { // new key
                  object[store.keyPath] = ++store.lastKeyGenerated;
                }
                store.data.push(object);
                request.onsuccess({ target :
                  { result : object[store.keyPath] }});
              } else {
                request.onerror('UNKNOWN_ERR');
              }
            }, 0);
            return request;
          };

          // Mocked delete from store
          //
          /* jshint es5:true */
          store.delete = function (object) {
          /* jshint es5:false */
            var request = {};
            setTimeout(function () {
              if (txn._isAborted || shouldFail()) {
                request.onerror('ABORT_ERR');
                return;
              }

              if (!db.isOpen) {
                request.onerror('NOT_ALLOWED_ERR');
                return;
              }

              if (type === 'readonly') {
                request.onerror('READ_ONLY_ERR');
              } else if (type === 'readwrite') {
                // TODO: a better way to remove? (find + delete leaves hole)
                store.data = _.reject(store.data, function (o) {
                  // TODO: this only works with keyPath = one key
                  var found = o[store.keyPath] === object;
                  return found;
                });
                request.onsuccess({ target : { result : object }});
              } else {
                request.onerror('UNKNOWN_ERR');
              }
            }, 0);
            return request;
          };

          // Mocked read using a cursor
          //
          store.openCursor = function (range, direction) {
            if (shouldFail()) {
              throw window.DOMException.constructor(
                window.DOMException.INVALID_STATE_ERR, 'Error Message');
            }

            var cursor = {};

            cursor.range = range;
            cursor.direction = direction;

            setTimeout(function () {
              var items = store.data;
              var pos = 0;
              var nextValue = function () {
                while (pos < items.length) {
                  var value = items[pos++];
                  if (value && valueInRange(value[store.keyPath],
                    cursor.range)) {
                    return value;
                  }
                }
                return null;
              };

              var item = {};
              /* jshint es5:true */
              item.continue = function () {
                if (pos < items.length) {
                  item.value = nextValue();
                  setTimeout(function () {
                    cursor.onsuccess({ target: { result : item } });
                  }, 0);
                } else {
                  setTimeout(function () {
                    cursor.onsuccess({ target: { result : null } });
                  }, 0);
                }
              };
              item.continue(); // fetch first
              /* jshint es5:false */
            }, 0);
            return cursor;
          };

          // Mocked finding of an index
          //
          store.index = function (indexName) {

            var index = store.createdIndexes[indexName];
            if (!index) {
              throw window.DOMException.constructor(
                window.DOMException.INVALID_STATE_ERR, 'Store not found');
            }

            // Mocked read using a cursor and the index
            index.openCursor = function (range, direction) {
              if (shouldFail()) {
                throw window.DOMException.constructor(
                  window.DOMException.INVALID_STATE_ERR, 'Error Message');
              }

              var cursor = {};

              cursor.range = range;
              cursor.direction = direction;


              // TODO: to properly sort items, precalculate result
              // then sort it based on index
              setTimeout(function () {
                var items = store.data;
                var pos = 0;
                var nextValue = function () {
                  while (pos < items.length) {
                    var value = items[pos++];
                    if (value && valueInRange(value[index.keyPath],
                      cursor.range)) {
                      return value;
                    }
                  }
                  return null;
                };

                var item = {};
                /* jshint es5:true */
                item.continue = function () {
                  if (pos < items.length) {
                    item.value = nextValue();
                    setTimeout(function () {
                      cursor.onsuccess({ target: { result : item } });
                    }, 0);
                  } else {
                    setTimeout(function () {
                      cursor.onsuccess({ target: { result : null } });
                    }, 0);
                  }
                };
                item.continue(); // fetch first
                /* jshint es5:false */
              }, 0);
              return cursor;
            };
            return index;
          };

          return store;
        };

        return txn;
      };

      db.dbname = dbname;
      db.dbversion = dbversion;

      setTimeout(function () {
        if (!shouldFail()) {
          db.isOpen = true;
          openrequest.onupgradeneeded(
            { target : { result : db, transaction : {} },
              oldVersion : 0, newVersion : 1 });
          openrequest.onsuccess({ target : { result : db } });
        } else {
          openrequest.onerror({ target : { error : 'BAD' }});
        }
      }, 0);

      return openrequest;
    };


    // Mock range helper classes
    dbManager._savedIdbKeyRange = dbManager._idbKeyRange;
    dbManager._idbKeyRange = {};
    dbManager._idbKeyRange.bound = function (upper, lower,
      openLower, openUpper) {
      return { upper: upper, lower: lower,
               openLower: openLower, openUpper: openUpper};
    };
    dbManager._idbKeyRange.lowerBound = function (lower, openLower) {
      return { lower: lower, openLower: openLower};
    };
    dbManager._idbKeyRange.upperBound = function (upper, openUpper) {
      return { upper: upper, openUpper: openUpper};
    };
    dbManager._idbKeyRange.only = function (key) {
      return { lower: key, upper: key, openUpper: false, openLower: false };
    };

  };

  indexedDBMock.releaseFakeStorage = function () {
    if (typeof dbManager._savedIndexedDB === 'undefined') {
      console.error('Attempt to restore fake storage but not set');
      return;
    }
    dbManager._indexedDB = dbManager._savedIndexedDB;
    dbManager._idbKeyRange = dbManager._savedIdbKeyRange;
    delete dbManager._savedIndexedDB;
  };

  // provide 'undefined' to disable fail simulation
  indexedDBMock.setFailAfter = function (operations) {
    dbManager._indexedDB.failCount = operations;
  };

  return indexedDBMock;
});