define([
  'backbone',
  'underscore'
], function (Backbone, _) {
  'use strict';

  // Quite a bit of this borrowed from Gaia's work in
  // https://github.com/mozilla-b2g/gaia/blob/master/apps/communications
  //         /dialer/js/call_log_db.js
  //
  //
  // Notes
  // ------------------------------------------------------------------------
  //
  // IndexedDB is quite complex. In essence it works as a regular RDBMS. It
  // has tables, indexes, queries, transactions, cursors.
  //
  // * A table is referred to as 'store'.
  //
  // * Transactions are created programmatically
  //   * Transactions are commited automatically when the last of the callbacks
  //     is executed.
  //   * Transactions can be aborted using txn.abort() to prevent commit.
  //
  // * In case of schema changes, you need to extend the 'onupgradeneeded'
  // method to consider the new migration.
  //
  //

  var dbManager = {
    _db: null, // currently open database instance,

    _openingDB: false,

    _pendingActions: [], // to store transactions until the database is open

    _consumePendingActions: function (err, db) {
      var action;
      while ((action = this._pendingActions.shift())) {
        action(err, db);
      }
    },

    /**
      * Prepare the database. This may include opening the database and upgrade
      * it to the latest schema version.
      *
      * param callback(error, database)
      *   Function that takes an error and db argument. It is called when
      *   the database is ready to use or if an error occurs while preparing
      *   the database.
      *
      *   Errors (strings):
      *   null if none.
      *   'NO_INDEXED_DB_AVAILABLE'
      *   'DB_REQUEST_BLOCKED'
      *   + IndexedDB errors:
      *    ABORT_ERR (abort called),
      *    CONSTRAINT_ERR (ex. key already exists or index finds duplicate)
      *    DATA_ERR (usually null somewhere...)+
      *    NOT_TRANSIENT_ERR (something failed, will fail again even if retry)
      *    NOT_ALLOWED_ERR
      *    NOT_FOUND_ERR
      *    QUOTA_ERR (ex. the user refuses to allow more space for the app)
      *    READ_ONLY_ERR (attemp to modify during a read only transaction)
      *    TIMEOUT_ERR (timeout while waiting to get transaction lock)
      *    TRANSACTION_INACTIVE_ERR
      *    UNKNOWN_ERR (ex. disk IO)
      *    VER_ERR (IDBOpenDBRequest requests version lower than the one in use)
      *
      * return (via callback) a database ready for use.
      */
    _ensureDB: function dbManagerEnsureDB(callback) {
      if (this._db) {
        callback(null, this._db);
        return;
      }

      try {
        if (!this._indexedDB) {
          callback('NO_INDEXED_DB_AVAILABLE', null);
          return;
        }

        this._pendingActions.push(callback);

        if (this._openingDB) {
          return;
        }

        this._openingDB = true;
        var request = this._indexedDB.open(this.dbName, this.dbVersion);
        request.onsuccess = _.bind(function dbManagerEnsureDbOnSuccess(event) {
          this._openingDB = false;
          this._db = event.target.result;
          this._consumePendingActions(null, this._db);
        }, this);

        request.onerror = function dbManagerEnsureDbOnError(event) {
          this._openingDB = false;
          this._consumePendingActions(event.target.errorCode, null);
        }.bind(this);

        request.onblocked = function dbManagerEnsureDbOnBlocked() {
          this._openingDB = false;
          this._consumePendingActions('DB_REQUEST_BLOCKED', null);
        }.bind(this);

        request.onupgradeneeded = _.bind(function dbManagerEnsureDbOnUp(event) {
          var db = event.target.result;
          var txn = event.target.transaction;
          var currentVersion = event.oldVersion;

          while (currentVersion !== event.newVersion) {
            switch (currentVersion) {
            case 0: // called when there is no database
              console.log('Migration: initialize schema');
              this._createSchema(db);
              break;
            // TODO: Let's refactor once we have more than one version to avoid
            // an humongous swtich statement. Psss: dynamic dispatching!
            case 1:
              console.log('Migration: schema update from 1 to version 2');
              this._upgradeSchemaFromVersion1(db, txn);
              break;
            default:
              console.error('Missing database migration code');
              event.target.transaction.abort();
              break;
            }
            currentVersion++;
          }

        }, this);
      } catch (ex) {
        this._consumePendingActions(ex.message, null);
      }
    },


   /**
     * Start a new database transaction.
     *
     * param txnType
     *        Type of transaction ('readwrite', 'readonly').
     * param callback(error, txn, stores)
     *        Function to call when the transaction is available. It will be
     *        invoked with the transaction and the requested object stores.
     *        See _ensureDB for error codes, only IndexedDB errors are used.
     *        error = null if no error.
     * param objectStores
     *        The names of object stores and indexes that are in the scope of
     *        the new transaction as an array of strings. Specify only the
     *        object stores that you need to access. If you need to access only
     *        one object store, you can specify its name as a string.
     *        If not provided, it will open all stores
     */
    _newTxn: function dbManagerNewTxn(txnType, objectStores, callback) {
      if (!objectStores) {
        objectStores = [this.allStores];
      }
      if (!Array.isArray(objectStores)) {
        objectStores = [objectStores];
      }
      this._ensureDB(function dbManagerNewTxnOnDB(error, db) {
        if (error) {
          callback(error);
          return;
        }
        var txn = db.transaction(objectStores, txnType);
        var stores = [];
        for (var i = 0; i < objectStores.length; i++) {
          stores.push(txn.objectStore(objectStores[i]));
        }
        callback(null, txn, stores);
      });
    },

    // Closes currently open database
    close: function dbmanagerClose() {
      if (this._db) {
        this._db.close();
        this._db = null;
      }
    },

    /**
      * Create the initial database schema.
      *
      * param db
      *   Database instance.
      */
    _createSchema: function dbManagerCreateSchema(db) {
      // The object store hosting received/sent messages:
      // {
      //   _id: <int> (auto incremented, primary key, 'free' with IndexedDB)
      //   date: <Date>,
      //   commId: <String>, (indexed, unique, incremental, ordered)
      //   type: <String>,
      //   msisdn: <String>,
      //   displayName : <String>,
      //   conversationId: <string>,
      //   contents: <String>,
      //   status: <string>
      // }
      var objStore = db.createObjectStore(
        this.dbMessagesStore,
        { keyPath: '_id',
          autoIncrement: true
        });

      // To define indexes, the 'keypath' can be as defined in:
      //  http://www.w3.org/TR/IndexedDB/#key-path-construct
      objStore.createIndex('date', 'date');
      objStore.createIndex('commId', 'commId', { unique : true });
      objStore.createIndex('conversationId', 'conversationId');
      objStore.createIndex('conversationId_date', ['conversationId', 'date']);
    },

    /**
     * Upgrade schema from version 1 to 2. Adds the contacts store. For contact
     * structure see Contact model API.
     */
    _upgradeSchemaFromVersion1: function _upgradeSchemaFromVersion1(db) {
      var objStore = db.createObjectStore(
        this.dbContactsStore,
        { keyPath: 'phone' }
      );

      objStore.createIndex('displayName', 'displayName');
    },


    // Removes everything from all define stores
    // - callbackIfBlocked: true || false || undefined
    //     defaults to false. If set, callback is called even if blocked
    //     otherwise it might never be called
    //
    destroySchema: function (callback, callbackIfBlocked) {
      this.close();
      var request = this._indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = function () {
        callback();
      };
      request.onerror = function () {
        callback();
      };
      request.onblocked = function (event) {
        console.log('Database delete blocked', event.oldVersion,
          event.newVersion);
        if (callbackIfBlocked) { callback(); }
      };
      // request.onupgradeneeded = function () {
      //   callback();
      // };
    },

    // ------------------------------------------------------------------------
    //
    // Helper functions to access all storage objects
    //
    // ------------------------------------------------------------------------

    // Add or more items
    //
    // params: {
    //  store : string (use dbManager.dbMessagesStore, etc)
    //  value : jsonObject || [arrayOfJsonObjects]
    //  callback : (optional) function,
    //  continueOnError : (optional) true || false
    // }
    //
    // value:
    //  In case of Message this can be
    //  {
    //    date: <Date>,
    //    commId: <string>,
    //    type: <string>,
    //    msisdn: <string>,
    //    displayName : <string>
    //    conversationId: <string>,
    //    status: <string>
    //  }
    //  But there is no dependency on that.
    //
    //  It can also be an array of them.
    //  [
    //   { date: xxx, ... (same as above)},
    //   { date: xxx, ... (same as above)},
    //   { date: xxx, ... (same as above)}
    //  ]
    //
    // If an array is provided, either ALL objects will be stored, or none,
    // unless continueOnError = true.
    //
    // callback(error, keyResult):
    //   error: as in _ensureDB
    //           + INVALID_CALL if messageJson is invalid.
    //          null if succeeded.
    //   keyResult: the key of last object inserted (not provided if error)
    //
    // IMPORTANT
    // This function is only useful when all operations affect just ONE store.
    //

    save: function dbManagerSave(params) {

      var doCallback = function (error, result) {
        if (params.callback && params.callback instanceof Function) {
          params.callback(error, result);
        }
      };

      // Don't accept nulls
      if (params.value === null || params.value === undefined) {
        doCallback('INVALID_CALL: null value');
        return;
      }

      // Verify store name
      if (!(_.contains(this.allStores, params.store))) {
        doCallback('INVALID_CALL: unknown store ' + params.store +
          ' not in ' + this.allStores);
        return;
      }

      // Accept both one instance and an array of instances
      if (!Array.isArray(params.value)) {
        params.value = [params.value];
      }

      // Allow empty arrays to be provided
      if (!params.value.length) {
        doCallback(null);
        return;
      }

      // Create a new transaction and do work on it, it will automatically
      // commit
      this._newTxn('readwrite', [params.store],
                   function (error, txn, stores) {

        // Couldn't establish transaction
        if (error) {
          doCallback(error);
          return;
        }

        var store = stores[0];
        var didFail = null;

        // only invoke real callback after all have finished
        // It will received the value of last error
        var howMany = params.value.length;
        var afterCallback = function (error, result) {
          if (!--howMany) {
            doCallback(error, result);
          }
        };

        // Save all
        _.forEach(params.value, function dbManagerSaveForEach(obj) {
          var request = store.put(obj);
          request.onerror = function (error) {
            didFail = error;
            if (!params.continueOnError) {
              txn.abort(); // other operations will fail, plus prevents commit
            }
            afterCallback(didFail);
          };
          request.onsuccess = function (event) {
            afterCallback(didFail, event.target.result);
          };
        });

      });
    },

    // Remove an item based on key, or all the items if provided with
    // an array.
    //
    // params = {
    //   key : string || number || Array of string || Array of number
    //   store : string
    //   callback : function (error) || undefined
    //   continueOnError : (default: false) true || false || undefined
    // }
    //
    // key:
    //   The key (or an array of keys) to be used when searching for
    //   the element to remove. For dbMessagesStore this is the _id
    //   attribute.
    //
    // store:
    //   The store name. Use dbManager.dbMessagesStore etc.
    //
    // callback : function (error)
    //   Will receive a null error if everything went ok.
    //
    // continueOnError: If set, an error will not trigger a rollback of
    //   the transaction and instead will continue with the other items.
    //   The callback function will be called with the last error received.
    //   Use this when you don't really care or have no means to actually
    //   process failed items.
    //
    remove: function dbManagerRemove(params) {

      var doCallback = function (error) {
        if (params.callback && params.callback instanceof Function) {
          params.callback(error);
        }
      };

      // Don't accept nulls
      if (params.key === null || params.key === undefined) {
        doCallback('INVALID_CALL: null key');
        return;
      }

      // Verify store name
      if (!(_.contains(this.allStores, params.store))) {
        doCallback('INVALID_CALL: unknown store ' + params.store +
          ' not in ' + this.allStores);
        return;
      }

      // Accept both one instance and an array of instances
      if (!Array.isArray(params.key)) {
        params.key = [params.key];
      }

      // Allow empty arrays to be provided
      if (!params.key.length) {
        doCallback(null);
        return;
      }

      // Create a new transaction and do work on it, it will automatically
      // commit
      this._newTxn('readwrite', [params.store],
                   function (error, txn, stores) {

        // Couldn't establish transaction
        if (error) {
          doCallback(error);
          return;
        }

        var store = stores[0];
        var didFail = null;

        // only invoke real callback after all have finished
        // It will received the value of last error
        var afterCallback = _.after(params.key.length, doCallback);

        // Save all
        _.forEach(params.key, function dbManagerRemoveForEach(obj) {
          /* jshint es5:true */
          var request = store.delete(obj);
          /* jshint es5:false */
          request.onerror = function (error) {
            didFail = error;
            if (!params.continueOnError) {
              txn.abort(); // other operations will fail, plus prevents commit
            }
            afterCallback(didFail);
          };
          request.onsuccess = function () {
            afterCallback(didFail);
          };
        });

      });
    },


    // Read a subset of entries
    //
    // params = {
    //  store : 'store',
    //  callback : function,
    //  sortedBy : undefined || indexName,
    //  rangeMin : undefined || object || number || string,
    //  rangeMax : undefined || object || number || string,
    //  value : undefined || object || number || string
    //  loadWithCursor : (default: true) undefined || true || false,
    //  filterFunction : undefined || function,
    //  limit : undefined || number
    //  reverse : (default: false) undefined || true || false,
    // }
    //
    // * rangeMin/rangeMax and value are mutually exclusive.
    // * rangeMin/rangeMax/value/reverse need sortedBy
    //
    // store:
    //   The store to read from (pass dbManager.dbMessagesStore etc)
    //
    // callback(error, item)
    // callback(error, items)
    //   First parameter is always error, as in _ensureDB, *null* if all ok.
    //
    //   if "loadWithCursor" is true, then
    //      callback(error, item):
    //        error = string or null
    //        item = { value : (JS object), continue : function } item fetched
    //        After processing the item, you have to invoke item.continue() to
    //        get the next one.
    //      ATTENTION! Callback will be invoked with null, null, null after
    //        finishing.
    //
    //   if "loadWithCursor" is false, then:
    //      callback(error, items):
    //        error = string or null
    //        items = null or array of objects read.
    //
    // sortedBy: One of the valid index names for the store
    //   (ex. 'date', 'commId', 'conversationId')
    //   By convention index names have the name of the parameter they index on,
    //   but check createSchema and upgrade schema functions for index names.
    //   There also compound indexes like 'conversationId_date' that allow
    //   searching for more than one field.
    //
    // reverse: true to return values in reverse, false or undefined for normal.
    //
    // rangeMin, rangeMin.
    //   Range of values to query. Used to quickly filter results.
    //
    // value
    //   If we want to retrieve instead of a range just by an specific, we
    //   can provide this. Value needs to be one valid for the selected index
    //   from 'sortedBy'.
    //
    // filterFunction:
    //   You can pass a filter function that will invoked with each item's value
    //   then test for other conditions and return true or false. True means
    //   it will be included in the results, false it will be ignored.
    //
    // limit:
    //   Max number of values to return.
    //
    // Using a cursor is better than loading all objects as it uses less memory,
    // but it's potentially a bit slower. Internally we always use a cursor
    // anyway.
    //
    read: function dbManagerRead(params) {

      var _this = this;

      if (!params || typeof params !== 'object') {
        return;
      }

      // A read with no callback can't happen
      if (!params.callback || !params.callback instanceof Function) {
        return;
      }

      if (!params.store) {
        params.callback('INVALID_CALL');
        return;
      }

      if (!params.sortedBy &&
        typeof params.rangeMin !== 'undefined' &&
        typeof params.rangeMax !== 'undefined' &&
        typeof params.reverse !== 'undefined' &&
        typeof params.value !== 'undefined') {
        params.callback('INVALID_CALL');
        return;
      }

      // All is done withing a transaction
      this._newTxn('readonly', [params.store],
        function (error, txn, stores) {

        // Couldn't establish transaction
        if (error) {
          params.callback(error);
          return;
        }

        var result = [];

        // Define range if needed (careful, it could be a 0, or empty string
        // and that would be valid)
        var setRange = function (value, rangeMin, rangeMax) {
          if (value !== undefined) {
            return _this._idbKeyRange.only(value);
          } else if (rangeMin !== undefined && rangeMax !== undefined) {
            return _this._idbKeyRange.bound(rangeMin, rangeMax, false, true);
          } else if (rangeMin !== undefined && rangeMax === undefined) {
            return _this._idbKeyRange.lowerBound(rangeMin, false);
          } else if (rangeMin === undefined && rangeMax !== undefined) {
            return _this._idbKeyRange.upperBound(rangeMax, true);
          } else {
            return null;
          }
        };
        var range = setRange(params.value, params.rangeMin, params.rangeMax);

        // Create a cursor, obeying range restrictions and reverse if needed
        var cursorRequest;
        var store = stores[0];
        var direction = params.reverse ? 'prev' : 'next';
        if (params.sortedBy) {
          cursorRequest = store.index(params.sortedBy).openCursor(range,
            direction);
        } else {
          cursorRequest = store.openCursor(range, direction);
        }

        var limit = params.limit;

        // Each time we read an item, store it or pass it to callback
        // Keep count of how many so that we don't exceed limit (if set).
        var doSuccessfulCallback = function (item) {
          if (!params.loadWithCursor) {
            result.push(item.value);
          } else {
            /* jshint es5:true */
            params.callback(null, item); // pass one
            /* jshint es5:false */
          }

          if (typeof limit !== 'undefined' && limit > 0) {
            limit--;
            if (limit === 0) {
              return true; // max results reached, exit loop
            }
          }
        };

        // After all finished, a final callback is always sent
        var finalCallback = function () {
          if (!params.loadWithCursor) {
            params.callback(null, result); // return all read, all at once
          } else {
            params.callback(null, null); // final callback to say finished
          }
        };

        // onsuccess is called each time an item is fetched
        cursorRequest.onsuccess = function dbManagerReadSuccess(event) {

          var finished;
          var item = event.target.result;

          if (!item) {
            // No more matching records
            finalCallback();
            return;
          }

          if (!params.filterFunction ||
              !params.filterFunction instanceof Function ||
              params.filterFunction(item.value)) {
            finished = doSuccessfulCallback(item);
          }

          if (!finished) {
            if (!params.loadWithCursor) {
              /* jshint es5:true */
              item.continue();
              /* jshint es5:false */
            }
          }
          else { // finished by limit
            finalCallback();
          }

        };

        cursorRequest.onerror = function (event) {
          params.callback(event.target.error.name);
        };
      });
    }
  };

  // this can be used to mock indexedDB functionality
  dbManager._indexedDB = window.indexedDB || window.webkitIndexedDB ||
              window.mozIndexedDB || window.msIndexedDB;

  dbManager._idbKeyRange = window.IDBKeyRange;

  // Database name and stores ('tables')
  dbManager.dbName = 'dbHistory';
  dbManager.dbMessagesStore = 'dbMessages';
  dbManager.dbConversationsStore = 'dbConversations';
  dbManager.dbContactsStore = 'dbContacts';
  dbManager.allStores = [dbManager.dbMessagesStore,
                         dbManager.dbConversationsStore,
                         dbManager.dbContactsStore];

  // Database version
  // Update this when schema changes
  dbManager.dbVersion = 2;

  return dbManager;
});
