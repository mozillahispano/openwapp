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
      console.log('called init');
      this.mcc = '';
      this.mnc = '';
      this.possibleSimCards = []; //only relevant if multiple sims found
      this.selectedSimCard = null;
      this.proposedCountry = null;
      this.countryTables = new CountriesCollection();
      this.countryChooseEnabled = true;
      this.mccMncChooseEnabled = true;
      this.getMccAndMnc();
    },

    events: {
      'submit #register':            'gotoConfirmation',
      'submit #register-conf':       'register',
      'submit #register-network':    'networkSelected',
      'click  #validate-button':     'goToValidate',
      'click  .icon-back':           'back',
      'blur   #country-select':      'setCountryPrefix',
      'blur   #sim-select' :         'setSimCard',
      'blur   #carrier-select':      'setCarrier',
      'blur   #mcc-mnc-select':      'setNetwork',
      'click  #choose-sim':          'showSimSelect',
      'click  #choose-country':      'showSelect',
      'click  #choose-carrier':      'showCarrierSelect',
      'click  #choose-mcc-mnc':      'showMccMncSelect',
      'click  .tos a':               'showTOS'
    },

    render: function () {
      if (global.updateNeeded) {
        console.log('Old app version. Need to update');
        this.$el.html(templates.updateNeeded);
      } else {
        var message, stringId;
        var l10n = global.localisation[global.language];

        if (this.possibleSimCards.length === 0) {
          stringId = 'countryNotDetectedOnLogin';
          message = l10n[stringId];
        }
        else if (this.possibleSimCards.length === 1) {
          var interpolate = global.l10nUtils.interpolate;
          stringId = 'countryDetectedOnLogin';
          message = interpolate(l10n[stringId], {
            country: this.countryTables.getCountryByMccMnc(
              this.selectedSimCard.mcc, this.selectedSimCard.mnc)
          });
        } else {
          stringId = 'multipleSimCards';
          message = l10n[stringId];
        }
        console.log(message);
        var el = this.template({
          countryDetectionMessage: message
        });
        this.$el.html(el);
        this.populateCountryNames();
        if (this.possibleSimCards.length > 1) {
          this.populateSimCards();
        }
        this.$el.removeClass().addClass('page init');
      }
    },

    getMccAndMnc: function () {
      var SimCardList = (
          // < 1.3
          (navigator.mozMobileConnection && [navigator.mozMobileConnection]) ||
            // >= 1.3; this isn't really an array but an iterable
          (navigator.mozMobileConnections &&
            Array.from(navigator.mozMobileConnections))||
            // simulator
          []
      ),
        possibleSimCards = SimCardList.
          map(function(sim, index) {
            console.log(sim, index);
            var network = (sim.lastKnownHomeNetwork ||
                           sim.lastKnownNetwork || '-').
                            split('-');
            console.log(network);
            return {
              index: index,
              mcc: network[0],
              mnc: network[1]
            };
          }).
          filter(function(sim) {
            return sim.mcc && sim.mnc;
          });
      if (possibleSimCards.length === 1) {
        console.log('Single sim card found', possibleSimCards[0]);
        this.selectedSimCard = possibleSimCards[0];
        this.possibleSimCards = possibleSimCards;
      } else if (possibleSimCards.length > 1) {
        console.log('Multiple usable sim cards found', possibleSimCards);
        this.possibleSimCards = possibleSimCards;
      } else {
        console.warn('No usable sim card found');
      }
    },

    populateSimCards: function () {
      var _this = this,
        $select = this.$el.find('#sim-select').html(''),
        $choose = this.$el.find('#choose-sim'),
        $button = this.$el.find('#register button'),
        $mobileNumberInput = this.$el.find('#register input'),
        $prefixChoose = this.$el.find('#choose-country');
      this.possibleSimCards.map(function(sim) {
        console.log(_this.countryTables);
        var country = _this.countryTables.getCountryByMccMnc(sim.mcc, sim.mnc),
          carrier = country.getCarrier(sim.mcc, sim.mnc);
        $select.append(new Option(
          'Slot ' + sim.index + ': ' + carrier, sim.index
        ));
      });
      $choose.removeClass('hidden');
      $button.attr('disabled', true);
      $mobileNumberInput.attr('disabled', true);
      $prefixChoose.removeClass('action');
      this.countryChooseEnabled = false;
    },

    setSimCard: function(evt) {
      var simNumber = $(evt.target).val(),
        simCard = this.possibleSimCards[simNumber],
        $countrySelect = this.$el.find('#country-select'),
        $chooseSim = this.$el.find('#choose-sim'),
        country = this.countryTables.getCountryByMccMnc(
          simCard.mcc, simCard.mnc),
        carrier = country.getCarrier(simCard.mcc, simCard.mnc),
        $button = this.$el.find('#register button'),
        $mobileNumberInput = this.$el.find('#register input'),
        $prefixChoose = this.$el.find('#choose-country');
      this.selectedSimCard = simCard;
      $chooseSim.html('Slot ' + simNumber + ': ' + carrier);
      $countrySelect.val(country.get('code'));
      this.setCountryPrefix({target: $countrySelect, preventDefault: String});
      $button.removeAttr('disabled');
      $mobileNumberInput.removeAttr('disabled');
      $prefixChoose.addClass('action');
      this.countryChooseEnabled = true;
    },

    populateNetworkNames: function() {
      var $select = this.$el.find('#carrier-select').html('');
      Object.keys(this.proposedCountry.get('carriers')).
        map(function(carrierName) {
          $select.append(new Option(carrierName, carrierName));
        });
      this.populateNetworks($select.val());
    },

    populateNetworks: function(networkName) {
      var $mccMncSelect = this.$el.find('#mcc-mnc-select').html('');
      this.proposedCountry.get('carriers')[networkName].
        map(function(network, index) {
          $mccMncSelect.append(new Option(
            'MCC: ' + network.mcc + ', MNC: ' + network.mnc,
            index
          ));
        });
    },

    setCarrier: function(evt) {
      var networkName = $(evt.target).val();
      this.$el.find('#choose-carrier').html(networkName);
      this.populateNetworks(networkName);
    },

    setNetwork: function(evt) {
      var mccMncIndex = $(evt.target).val(),
        carrier = this.$el.find('#carrier-select').val(),
        network = this.proposedCountry.get('carriers')[carrier][mccMncIndex];
      this.$el.find('#choose-mcc-mnc').html(
        'MCC: ' + network.mcc + ', MNC: ' + network.mnc
      );
      this.$el.find('#network-submit').removeAttr('disabled');
      this.mcc = network.mcc;
      this.mnc = network.mnc;
    },

    setNetworkFromElem: function($elem, carrier) {
      var networkNumber = $elem.val(),
        network = this.proposedCountry.get('carriers')[carrier][networkNumber];
      console.log(networkNumber);
      this.mcc = network.mcc;
      this.mnc = network.mnc;
      console.log(network);
    },

    populateCountryNames: function () {
      var _this = this,
        $select = this.$el.find('#country-select').html('');
      this.countryTables.forEach(function (country) {
        var isSim = _this.selectedSimCard && country.hasMccMnc(
          _this.selectedSimCard.mcc, _this.selectedSimCard.mnc
        );
        $select.append(new Option(country.toString(), country.get('code'),
          true, isSim));
        if (isSim) {
          _this.$el.find('.country-prefix').html(country.get('prefix'));
          _this.proposedCountry = country;
        }
      });
    },

    showSelect: function () {
      if (!this.countryChooseEnabled) {
        return;
      }
      var $select = this.$el.find('#country-select');
      $select.focus();
    },

    showSimSelect: function () {
      var $select = this.$el.find('#sim-select');
      $select.focus();
    },

    showCarrierSelect: function () {
      var $select = this.$el.find('#carrier-select');
      $select.focus();
    },

    showMccMncSelect: function () {
      if (!this.mccMncChooseEnabled) {
        return;
      }
      var $select = this.$el.find('#mcc-mnc-select');
      $select.focus();
    },

    setCountryPrefix: function (evt) {
      evt.preventDefault();
      var country = this.countryTables
          .getSelectedCountry($(evt.target).val());
      this.$el.find('.country-prefix').html(country.get('prefix'));
      this.proposedCountry = country;
    },

    gotoConfirmation: function (evt) {
      evt.preventDefault();
      var countryCode = $(evt.target).find('#country-select').val();
      var phoneParts = this._getPhoneParts();

      var isValid = this._checkPhoneNumber(phoneParts, countryCode);
      if (!isValid) {
        return;
      }
      var $confirmationForm = this.$el.find('#register-conf');
      $confirmationForm.find('input[name=msisdn]').val(phoneParts.number);
      if (this.selectedSimCard && this.proposedCountry.hasMccMnc(
          this.selectedSimCard.mcc, this.selectedSimCard.mnc)) {
        this.mcc = this.selectedSimCard.mcc;
        this.mnc = this.selectedSimCard.mnc;
        console.log('mcc', this.mcc);
        console.log('mnc', this.mnc);
        this.next('confirmation');
      } else {
        this.populateNetworkNames();
        this.next('network-prompt');
      }
    },

    goToValidate: function (evt) {
      evt.preventDefault();

      var phoneParts = this._getPhoneParts('#confirm-phone-page');
      global.router.navigate(
        'validate/' + phoneParts.number + '/' + phoneParts.prefix,
        { trigger: true }
      );
    },

    networkSelected: function () {
      var stringId = 'sameNumberMultiplePhonesWarning',
        message = global.localisation[global.language][stringId];
      console.log('chosen mcc', this.mcc);
      console.log('chosen mnc', this.mnc);
      window.alert(message);
      this.next('confirmation');
    },

    _getPhoneParts: function (pageId) {
      pageId = pageId || '#login-page';
      var code = this.$el.find('#country-select').val();
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
        var countrySelect = this.$el.find('#country-select')[0];
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
        /*jshint -W069*/
        /*Justification: camelCase/dotstyle conflict*/
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
