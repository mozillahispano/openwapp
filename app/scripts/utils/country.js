define([
  'backbone'
], function (Backbone) {
  'use strict';

  var Country = Backbone.Model.extend({
    defaults: function () {
      return {
        carriers: {},
        code: '',
        name: '',
        prefix: ''
      };
    },

    addMccMnc: function(mcc, mnc, networkname) {
      if (this.hasMccMnc(mcc, mnc)) {
        console.warn('Tried to add network with mcc ' + mcc + ' and mnc ' +
          mnc + ' multiple times to country ' + this.get('code'));
      }
      var networkList = this.get('networkList');
      if (!networkList.hasOwnProperty(networkname)) {
        networkList[networkname] = [];
      }
      networkList[networkname].push({mcc: mcc, mnc: mnc});
    },

    toString: function () {
      return this.get('name');
    },

    hasMccMnc: function(mcc, mnc) {
      return this.getCarrier(mcc, mnc) !== null && true || false;
    },

    getCarrier: function(mcc, mnc) {
      var carriers = this.get('carriers'),
        carrierList = Object.keys(carriers),
        neededCarrierList = carrierList.filter(function(carrierName) {
          return carriers[carrierName].filter(function(mccMnc) {
            return mccMnc.mcc === mcc && mccMnc.mnc === mnc;
          }).length > 0;
        });
      if (neededCarrierList.length === 0) {
        return null;
      } else {
        return neededCarrierList[0];
      }
    }
  });

  return Country;
});
