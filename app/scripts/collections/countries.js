define([
  'backbone',
  'underscore',
  'utils/country',
  'global'
], function (Backbone, _, Country, global) {
  'use strict';

  var Countries = Backbone.Collection.extend({
    model: Country,

    initialize: function () {
      this.fetchCountries();
    },

    comparator: function (item) {
      return item.get('name');
    },

    fetchCountries: function () {
      // Get from the countries.json. responseType to json is not allowed, see
      // http://updates.html5rocks.com/2012/01/Getting-Rid-of-Synchronous-XHRs
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/scripts/countries.json', false); // sync request
      xhr.send(null);

      //Fill with an empty country
      this.add(new Country({
        mcc: 0,
        code: '',
        name: global.localisation[global.language].country,
        prefix: ''
      }));

      if (xhr.status === 200) {
        var parsed = {};
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error('Something happened while trying to parse the JSON', e);
        }

        // And walk over all countries found
        var keys = _.keys(parsed);
        var _this = this;
        keys.forEach(function (key) {
          _this.add(new Country({
            mcc: parseInt(key, 10),
            code: parsed[key].code,
            name: parsed[key].full,
            prefix: parsed[key].prefix
          }));
        });
      } else {
        console.error(xhr.statusText);
      }
    },

    getSelectedCountry: function (value) {
      var result = this.find(function (model) {
        return model.get('code') === value;
      });
      return result;
    },

    getCountryByMCC: function (mcc) {
      var result = this.find(function (model) {
        return model.get('mcc') === mcc;
      });
      return result;
    }
  });

  return Countries;
});

