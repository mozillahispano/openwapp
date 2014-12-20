define([
  'backbone',
  'underscore',
  'utils/country',
  'global'
], function (Backbone, _, Country) {
  'use strict';

  var Countries = Backbone.Collection.extend({
    model: Country,

    initialize: function () {
      this.mccMncMap = new Map();
      this.fetchCountries();
    },

    comparator: function (item) {
      return item.get('name');
    },

    addCountry: function (country) {
      var carrier,
        _this = this,
        newCountry = new Country({
          carriers: country.carriers,
          code: country.code,
          name: country.full,
          prefix: country.prefix
        }),
        addNetworkToMap = function(network) {
          _this.mccMncMap.set(network.mcc + '-' + network.mnc, newCountry);
        };
      this.add(newCountry);
      for (carrier in country.carriers){
        if (country.carriers.hasOwnProperty(carrier)) {
          country.carriers[carrier].map(addNetworkToMap);
        }
      }
    },

    fetchCountries: function () {
      // Get from the countries.json. responseType to json is not allowed, see
      // http://updates.html5rocks.com/2012/01/Getting-Rid-of-Synchronous-XHRs
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/scripts/countries.json', false); // sync request
      xhr.send(null);

      if (xhr.status === 200) {
        var parsed = {};
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error('Something happened while trying to parse the JSON', e);
        }
        parsed.map(this.addCountry, this);
      } else {
        console.error(xhr.statusText);
      }
    },

    getSelectedCountry: function (value) {
      return this.find(function (model) {
        return model.get('code') === value;
      });
    },

    getCountryByMccMnc: function (mcc, mnc) {
      return this.mccMncMap.get(mcc + '-' + mnc);
    }
  });

  return Countries;
});
