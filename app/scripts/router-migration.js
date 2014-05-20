define([
  'backbone',
  'underscore',
  'global',
  'views/migration'
], function (Backbone, _, global, MigrationView) {
  'use strict';

  var Router = Backbone.Router.extend({
    initialize: function () {
    },

    routes: {
      ':old/:new': 'migration'
    },

    migration: function (oldVersion, newVersion) {
      var model = new Backbone.Model();
      model.set('oldVersion', parseInt(oldVersion, 10));
      model.set('newVersion', parseInt(newVersion, 10));
      this.show(new MigrationView({ model: model }));
    },

    show: function (view) {
      if (this.currentView) {
        // We use these methods instead of .remove() because remove()
        // deletes the View main element
        this.currentView.stopListening();
        this.currentView.undelegateEvents();
        this.currentView.$el.empty();

        // If defined call the close method of the view
        if (typeof this.currentView.close !== 'undefined') {
          this.currentView.close();
        }

        // Views can define a clear() method which should clean them for
        // avoiding memory leaks
        if (typeof this.currentView.clear !== 'undefined') {
          this.currentView.clear();
        }
      }

      this.currentView = view;
      this.currentView.render();
    }
  });

  return Router;
});
