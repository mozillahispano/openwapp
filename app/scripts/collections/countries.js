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
      var xhr = new XMLHttpRequest(),
        _this = this;
      xhr.open('GET', '/scripts/countries.json', false); // sync request
      xhr.send(null);

      //Fill with an empty country
      this.add(new Country({
        networkList: {},
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

        parsed.map(function(country) {
          _this.add(new Country({
            carriers: country.carriers,
            code: country.code,
            name: country.full,
            prefix: country.prefix
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

    getCountryByMccMnc: function (mcc, mnc) {
      //TODO: slow! maybe make a hashmap of concentated mcc and mnc
      return this.find(function (model) {
        return model.hasMccMnc(mcc, mnc);
      });
    }
  });

  return Countries;
});

