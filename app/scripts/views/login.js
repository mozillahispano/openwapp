define([
  'backbone',
  'zeptojs',
  'global',
  'templates',
  'utils/phonenumber',
  'collections/countries'
], function (Backbone, $, global, templates, PhoneNumber, CountriesCollection) {
  'use strict';

  var localStorage = window.localStorage;

  var Login = Backbone.View.extend({

    el: '#main-page',

    template: templates.login,

    previousPages: [],

    currentPage: 'init',

    initialize: function () {
      this.mcc = 0;
      this.mnc = 0;
      this.getMccAndMnc();
      this.countryTables = new CountriesCollection();
    },

    events: {
      'submit #register':         'gotoConfirmation',
      'submit #register-conf':    'register',
      'click button':             'goToValidate',
      'click .btn-back':          'back',
      'change select':            'setCountryPrefix',
      'click  legend':            'showSelect',
      'click  .tos a':            'showTOS'
    },

    render: function () {
      if (global.updateNeeded) {
        console.log('Old app version. Need to update');
        this.$el.html(templates.updateNeeded);
      } else {
        var message, stringId;
        var l10n = global.localisation[global.language];
        var _this = this;

        // No country found
        if (this.mcc === 0 || isNaN(this.mcc)) {
          stringId = 'countryNotDetectedOnLogin';
          message = l10n[stringId];
        }
        // Country found, show a proper message
        else {
          var interpolate = global.l10nUtils.interpolate;
          stringId = 'countryDetectedOnLogin';
          message = interpolate(l10n[stringId], {
            country: this.countryTables.getCountryByMCC(_this.mcc)
          });
        }
        var el = this.template({
          countryDetectionMessage: message
        });
        this.$el.html(el);
        this.populateCountryNames();
        this.$el.removeClass().addClass('page init');
      }
    },

    getMccAndMnc: function () {
      var mozCnx, network;
      var stringId;
      var multiSIMdetected = false;
      var _this = this;
      var l10n = global.localisation[global.language];
      // Firefox OS 1.1-
      if ((mozCnx = navigator.mozMobileConnection)) {
        network = (mozCnx.lastKnownHomeNetwork || mozCnx.lastKnownNetwork ||
          '-').split('-');
        this.mcc = parseInt(network[0], 10);
        this.mnc = parseInt(network[1], 10);
      }
      // Firefox OS 1.2+
      else if ((mozCnx = navigator.mozMobileConnections)) {
        if (navigator.mozMobileConnections.length > 1) {
          multiSIMdetected = true;
        }
        for (var c = 0; c < navigator.mozMobileConnections.length; c++) {
          network = (mozCnx[c].lastKnownHomeNetwork ||
            mozCnx.lastKnownNetwork || '-').split('-');
          _this.mcc = _this.mcc || parseInt(network[0], 10);
          _this.mnc = _this.mnc || parseInt(network[1], 10);
        }
      }
      // Desktop or simulator
      else {
        console.log('mozMobileConnection not available');
        stringId = 'simRequired';
        window.alert(l10n[stringId]);
      }

      if (multiSIMdetected) {
        stringId = 'multiSIMdetectedWarn';
        window.alert(l10n[stringId]);
      }

      if (isNaN(this.mcc)) {
        stringId = 'simRequired';
        window.alert(l10n[stringId]);
      }
    },

    populateCountryNames: function () {
      var _this = this;
      var $select = this.$el.find('#register select');
      $select.html('');
      var added = {};
      this.countryTables.forEach(function (country) {
        if (!added[country.get('code')]) {
          $select.append(new Option(country.toString(), country.get('code'),
            true, (_this.mcc === country.get('mcc'))));
          added[country.get('code')] = true;
        }
      });

      if (this.mcc === 0 || isNaN(this.mcc)) {
        return;
      }

      var country = this.countryTables.getSelectedCountry($('select').val());
      this.$el.find('legend').html(country.get('prefix'));
    },

    showSelect: function () {
      var $select = this.$el.find('select');
      $select.focus();
    },

    setCountryPrefix: function (evt) {
      evt.preventDefault();
      var country = this.countryTables
          .getSelectedCountry($(evt.target).val());
      this.$el.find('legend').html(country.get('prefix'));
    },

    gotoConfirmation: function (evt) {
      evt.preventDefault();
      var countryCode = $(evt.target).find('select').val();
      var phoneParts = this._getPhoneParts();

      var isValid = this._checkPhoneNumber(phoneParts, countryCode);
      if (!isValid) {
        return;
      }

      var $confirmationForm = this.$el.find('#register-conf');
      $confirmationForm.find('input[name=msisdn]').val(phoneParts.number);
      this.next('confirmation');
    },

    goToValidate: function (evt) {
      evt.preventDefault();

      var phoneParts = this._getPhoneParts('#confirm-phone-page');
      global.router.navigate(
        'validate/' + phoneParts.number + '/' + phoneParts.prefix,
        { trigger: true }
      );
    },

    _getPhoneParts: function (pageId) {
      pageId = pageId || '#login-page';
      var code = this.$el.find('select').val();
      var country = this.countryTables.findWhere({ code: code });
      var prefix = country.get('prefix').substr(1);
      var number = this.$el.find(pageId + ' input[name=msisdn]').val();
      return { prefix: prefix, number: number, complete: prefix + number };
    },

    register: function (evt) {
      var _this = this;
      evt.preventDefault();

      this.$el.find('section.intro > p').hide();
      this.toggleSpinner();

      var phoneParts = this._getPhoneParts('#confirm-phone-page');
      var countryCode = phoneParts.prefix;
      var phoneNumber = phoneParts.number;

      // TODO: Get locale from the i18n object (or from the phone number)
      localStorage.removeItem('isPinSent');
      phoneNumber = phoneNumber.replace(/[^\d]/g, '');
      global.auth
      .register(countryCode, phoneNumber, 'es-ES', _this.mcc, _this.mnc,
        function (err, details) {
          _this.toggleSpinner();
          if (err) {
            return _this.errorRegister(err, details);
          }
          var needsValidation = details;
          if (!needsValidation) {
            var destination = global.auth.get('screenName') ?
                              'inbox' : 'profile';
            global.router.navigate(destination, { trigger: true });
          }
          else {
            localStorage.setItem('isPinSent', 'true');
            localStorage.setItem('phoneAndCC', phoneNumber + '/' + countryCode);
            global.router.navigate(
              'validate/' + phoneNumber + '/' + countryCode,
              { trigger: true }
            );
          }
        }
      );
    },

    _checkPhoneNumber: function (parts, country) {
      if (!country) {
        window.alert(global.localisation[global.language].selectCountryAlert);
        return;
      }

      var international = PhoneNumber.parse(parts.complete, country);

      // show error if cannot parse number or parsed country is different.
      // PhoneNumber always change the country to uppercase, so
      // we should also for this check to work
      country = country.toUpperCase();
      if (!international || country !== international.region) {
        var countrySelect = this.$el.find('select')[0];
        var countryName =
          countrySelect.options[countrySelect.selectedIndex].textContent;
        var message =
          global.localisation[global.language].movilNumberValidationAlert;
        var interpolate = global.l10nUtils.interpolate;
        return window.confirm(interpolate(message, {
          country: countryName,
          number: parts.number,
          prefix: parts.prefix
        }));
      }
      return true;
    },

    next: function (nextPage) {
      this.previousPages.push(this.currentPage);
      this.$el.removeClass().addClass('page').addClass(nextPage);
      this.currentPage = nextPage;
    },

    back: function (evt) {
      evt.preventDefault();
      var previous = this.previousPages[this.previousPages.length - 1];
      this.$el.removeClass().addClass('page').addClass(previous);
      this.currentPage = previous;
      this.previousPages.pop(this.previousPages.length - 1);
    },

    toggleSpinner: function () {
      this.$el.find('.spinner').toggle();
      var button = this.$el.find('input[type=submit]');
      button.prop('disabled', !button.prop('disabled'));
    },

    errorRegister: function (err, data) {
      var l10n = global.localisation[global.language];
      var interpolate = global.l10nUtils.interpolate;
      var stringId, message;
      this.$el.find('section.intro > p').show();
      if (err === 'too_recent') {
        var tryAfter = (data && data['retry_after']) || 0;
        stringId = 'registerErrorTooRecent';
        message = interpolate(l10n[stringId], {
          minutes: Math.ceil(tryAfter / 60)
        });
      } else if (err === 'too_many') {
        stringId = 'registerErrorTooMany';
      } else if (err === 'old_version' || err === 'bad_token') {
        stringId = 'registerErrorOldVersion';
      } else if (err === 'stale') {
        stringId = 'registerErrorStale';
      } else if (err === 'no_routes') {
        stringId = 'registerErrorNoRoutes';
      } else {
        stringId = 'registerErrorGenericAlert';
        message = interpolate(l10n[stringId], {
          error: JSON.stringify(data, null, ' ')
        });
      }

      if (!message) {
        message = l10n[stringId];
      }
      window.alert(message);
    },

    showTOS: function (evt) {
      evt.preventDefault();
      window.open(
        evt.target.href,
        global.localisation[global.language].termsOfUse, 'dialog'
      );
    }
  });

  return Login;
});
