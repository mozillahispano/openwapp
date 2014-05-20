define([
  'backbone',
  'zeptojs',
  'global',
  'templates'
], function (Backbone, $, global, templates) {
  'use strict';

  var Index = Backbone.View.extend({

    el: '#main-page',

    template: templates.index,

    initialize: function () {
      var validCredentials = global.auth.get('validCredentials');

      // async database didn't finish
      if (validCredentials === null) {
        this.listenTo(
          global.auth, 'change:validCredentials', this._handleLogin);
      }
      else {
        this._handleLogin(global.auth);
      }
    },

    _handleLogin: function () {
      var validCredentials = global.auth.get('validCredentials');
      var nextScreen = validCredentials ? 'inbox' : 'login';
      global.router.navigate(nextScreen, { trigger: true });
    },

    render: function () {
      this.$el.html(this.template());
    }

  });

  return Index;
});
