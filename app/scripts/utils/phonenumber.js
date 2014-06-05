define(['libphonenumber/PhoneNumber'], function (PhoneNumber) {
  'use strict';

  var _region;
  var _number;
  var _areaCode;

  // Those are the specific rules that OpenWapp is using for special phone
  // numbers.
  var beforeRules = {
    AR: [{
      pattern: '(?:15)?(\\d{6,8})',
      output: '$1'
    }, {
      pattern: '(?:54)(?:9)?(\\d{10})',
      output: '549$1'
    }],
    MX: [{
      pattern: '(?:52)?1(\\d{10})',
      output: '52$1'
    }],
    CO: [{
      pattern: '^03(\\d{7})',
      output: '$1'
    }],
    CL: [{
      pattern: '^([9]\\d{7})',
      output: '09$1'
    }],
    VE: [{
      pattern: '(?:0)(\\d{10})',
      output: '$1'
    }]
  };

  var afterRules = [{
    pattern: '521(\\d{10})',
    output: '52$1'
  }];

  var _addAreaCode = function (number) {
    // When there is no BaseNumber, we can't add an area code
    if (!_number) {
      return number.nationalNumber;
    }
    var originLen = _number.nationalNumber.length;
    var numberLen = number.nationalNumber.length;

    var originAreaCode = _areaCode.substr(originLen - numberLen);
    var numberAreaCode = number.nationalNumber.substr(0, originLen - numberLen);

    // This logic is a little bit complicated.
    if (_areaCode !== null && numberLen < originLen &&
      (!originAreaCode || originAreaCode === numberAreaCode)) {
      return _areaCode.substr(0, originLen - numberLen) + number.nationalNumber;
    }
    return number.nationalNumber;
  };

  var _calcAreaCode = function (number) {
    var regions = number.internationalFormat.split(/[^\d]+/);
    // Fix for argentinian numbers.
    if (number.region === 'AR') {
      return regions[2] + regions[3];
    }
    return regions[2];
  };

  return {
    region: _region,

    setBaseNumber: function (number) {
      var phone = PhoneNumber.Parse('+' + number);

      if (!phone || !phone.internationalFormat) {
        throw 'Phone number not valid. It should be in international format' +
        ' without the leading +';
      }

      _number = phone;
      _region = phone.region;
      _areaCode = _calcAreaCode(phone);
      return this;
    },

    format : function (number) {
      var phone = PhoneNumber.Parse('+' + number);
      if (!phone || !phone.internationalFormat) {
        throw 'Phone number not valid. It should be in international format' +
        ' without the leading +';
      }

      return phone.internationalFormat;
    },

    validate: function (number, locale) {
      var phone = PhoneNumber.Parse(number, locale);
      if (!phone || !phone.internationalFormat) {
        return false;
      }
      return true;
    },

    parse: function (number, locale) {
      // Clean the number
      number = number.replace(/[^\d\+]+/g, '');

      _region = (locale || _region).toUpperCase();

      if (beforeRules[_region]) {
        beforeRules[_region].forEach(function (rule) {
          number = number.replace(new RegExp(rule.pattern), rule.output);
        });
      }

      var phone = PhoneNumber.Parse(number, _region);

      // If libphonenumber couldn't parse the number, return null
      if (!phone) {
        return null;
      }

      // when passing the locale, the validation is more strict
      // (there is no area code missing here)
      if (locale && !phone.internationalFormat) {
        return null;
      }

      // Add area code if it's missing (only when there is no locale)
      var nationalNumber = phone.nationalNumber;
      if (!locale) {
        nationalNumber = _addAreaCode(phone);
      }

      var full = phone.regionMetaData.countryCode + nationalNumber;

      afterRules.forEach(function (rule) {
        full = full.replace(new RegExp(rule.pattern), rule.output);
      });

      return {
        national: phone.nationalNumber,
        region: phone.region,
        full: full
      };
    }
  };
});
