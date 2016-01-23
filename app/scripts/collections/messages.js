define([
  'underscore',
  'backbone',
  'global',
  'models/message'
], function (_, Backbone, global, MessageModel) {
  'use strict';

  return Backbone.Collection.extend({
    model: MessageModel,

    initialize: function () {
      this.listenTo(this, 'remove', this._messageRemoved);
    },

    fetch: function () {
    },

    setStatusReceived: function (id) {
      var message = this.find(function (model) {
        return model.get('meta').commId === id;
      });
      if (message) {
        message.set('status', 'received');
        message.saveToStorage();
      }
    },

    _messageRemoved: function (model) {
      model.removeFromStorage();
    },

    /**
     * Order the collection by date
     * @param  two models to compare A B
     * @return -1 if A before B, 0 if equal, 1 if after.
     */
    comparator: function (message) {
      var meta = message.get('meta');
      var rv = -1;
      if (meta) {
        rv = meta.sentDate || meta.date;
      }

      return rv;
    },

    add: function (models, options) {
      if (Array.isArray(models)) {
        // filter out duplicates in the array
        var c = 0; // to make sure we don't remove undefined/null commIds
        models = _.unique(models, function (x) {
          var meta = x.get && x.get('meta') || x.meta;
          return meta && meta.commId || c++;
        });
      } else {
        models = [models]; // was just one
      }
      // filter out already existing messages
      models = this._clearRepeated(models);
      if (models) {
        Backbone.Collection.prototype.add.call(this, models, options);
      }
    },

    // XXX: Slow but safe (for faster algorithms, we need to sort collections
    // first). Notice that `add()` do almost the same but for `commId`. Notice
    // we are using `_id` which is not overlapping with backbone's default
    // idAttribute which is `id`.
    mergeById: function (messages) {
      var currentMessages = this.models;

      function hasMessage(target) {
        return _.find(currentMessages, function (message) {
          return message.get('_id') === target.get('_id');
        });
      }

      for (var i = 0, target; (target = messages[i]); i++) {
        if (!hasMessage(target)) {
          this.add(target);
        }
      }
    },

    push: function (model, options) {
      // XXX: Remember the simulator crashes on console.log() calls for
      // unknown reasons.
      if (!this._hasMessage(model)) {
        Backbone.Collection.prototype.push.call(this, model, options);
      }
    },

    _clearRepeated: function (models) {
      var _this = this;
      return _.filter(models, function (x) {
        return !(_this._hasMessage(x));
      });
    },

    _hasMessage: function (model) {
      if (!model) {
        return true;
      }

      var commId = null;
      if (model && model.get) { // model instance
        commId = model.get('meta').commId;
      }
      else { // just an Object
        commId = model.meta ? model.meta.commId : null;
      }

      return (commId && !!(this.find(function (x) {
        return x.get('meta').commId === commId;
      })));
    }
  });
});
