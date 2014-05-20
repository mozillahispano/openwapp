define([
  'backbone'
], function (Backbone) {
  'use strict';

  var Country = Backbone.Model.extend({
    defaults: function () {
      return {
        mcc: 0,
        code: '',
        name: '',
        prefix: ''
      };
    },

    toString: function () {
      return this.get('name');
    }
  });

  return Country;
});
