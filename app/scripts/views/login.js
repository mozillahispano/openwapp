/*
 * On this page, there exist three pages - one of which is optional:
 * * page 1: -init- user can enter phone number, choose country and optionally
 *   choose sim (if more than 1 are available & valid)
 * * page 2: -network- exists only if the user chose a country which doesn't
 *   match the chosen sim - which means always if no sim is available: The user
 *   has to choose carrier and network manually
 * * page 3: -confirm- the user can change his number (not the country) again
 *   and request the sms
 * A sim card belongs to a certain network.
 * A network can be uniquely identified by a mcc/mnc combination
 * A carrier consists of one or more networks and has a unique name per country
 * This means that a country can be identified by a mcc/mnc combination.
 */


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

    /***********************GENERAL*************************************/

    initialize: function () {
      this.mcc = '';
      this.mnc = '';
      this.possibleSimCards = []; //only relevant if multiple sims found
      this.selectedSimCard = null;
      this.proposedCountry = null;
      this.countryTables = new CountriesCollection();
      this.readSimCards();
      this.elements = {};
    },

    events: {
      'submit #register':            'goToConfirmation',
      'submit #register-conf':       'register',
      'submit #register-network':    'networkSelected',
      'click  #validate-button':     'goToValidate',
      'click  .icon-back':           'back',
      'blur   #country-select':      'setCountryPrefix',
      'blur   #sim-select' :         'setSimCard',
      'blur   #carrier-select':      'setCarrier',
      'blur   #mcc-mnc-select':      'setNetwork',
      'click  #sim-choose':          'showSimSelect',
      'click  #country-choose':      'showCountrySelect',
      'click  #carrier-choose':      'showCarrierSelect',
      'click  #network-choose':      'showNetworkSelect',
      'click  .tos a':               'showTOS'
    },

    render: function () {
      if (global.updateNeeded) {
        console.log('Old app version. Need to update');
        this.$el.html(templates.updateNeeded);
      } else {
        var message, stringId, countryName;
        
        if (this.possibleSimCards.length === 0) {
          message = navigator.mozL10n.get('countryNotDetectedOnLogin');
        }
        else if (this.possibleSimCards.length === 1) {
          this.selectedSimCard = this.possibleSimCards[0];
          stringId = 'countryDetectedOnLogin';
          countryName = this.countryTables.getCountryByMccMnc(
            this.selectedSimCard.mcc, this.selectedSimCard.mnc).attributes.name;
	  message = navigator.mozL10n.get([stringId], {
            'country': countryName
          });
        } else {
          message = navigator.mozL10n.get('multipleSimCards');
        }
        var el = this.template({
          countryDetectionMessage: message
        });
        this.$el.html(el);
        this.populateElements();
        this.populateCountryNames();
        this.populateSimCards();
        this.$el.removeClass().addClass('page init');
      }
    },

    populateElements: function () {
      var _this = this,
        e = function(selector) {
          return _this.$el.find(selector);
        };
      this.elements = {
        sim: {
          choose: e('#sim-choose'),
          select: e('#sim-select')
        },
        country: {
          choose: e('#country-choose'),
          select: e('#country-select')
        },
        carrier: {
          choose: e('#carrier-choose'),
          select: e('#carrier-select')
        },
        network: {
          choose: e('#network-choose'),
          select: e('#network-select')
        },
        submits: {
          init: e('#register .submit'),
          network: e('#network-submit')
        },
        forms: {
          init: e('#register'),
          network: e('#register-network'),
          confirm: e('#register-conf')
        },
        numberInput: e('#register input')
      };
    },

    readSimCards: function () {
      /*
       * Reads the sim cards out and populates ``this.possibleSimCards``
       * with a list of {mnc: {mnc}, mcc: {mcc}, slotNr: {slotNr}}
       * slotNr starts at 1
       */
      var SimCardList = (
          // < 1.3
          (navigator.mozMobileConnection && [navigator.mozMobileConnection]) ||
          // simulator
          []
      );
      /* >= 1.3; this isn't really an array but an iterable. Array.from
       * only exists since gecko 32, we support up to gecko 28
       */
      if (!(SimCardList.length) && navigator.mozMobileConnections) {
        for (var i = 0; i < navigator.mozMobileConnections.length; i++) {
          SimCardList.push(navigator.mozMobileConnections[i]);
        }
      }
      this.possibleSimCards = SimCardList.
          map(function(sim, index) {
            var network = (sim.lastKnownHomeNetwork ||
                           sim.lastKnownNetwork || '-').
                            split('-');
            return {
              slotNr: index + 1,
              mcc: network[0],
              mnc: network[1]
            };
          }).
          filter(function(sim) {
            return sim.mcc && sim.mnc;
          });
      console.log('Possible sim cards', this.possibleSimCards);
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

    /**********************PAGE 1 - INIT********************************/

    populateSimCards: function () {
      /*
       * Populates the sim card select and disables everything else - the sim
       * card should be selected first & selecting the sim card possibly the
       * country prefix automatically.
       */
      if (this.possibleSimCards.length < 2) {
        return;
      }
      var _this = this;
      this.possibleSimCards.map(function(sim, index) {
        var country = _this.countryTables.getCountryByMccMnc(sim.mcc, sim.mnc),
          carrier = country && country.getCarrier(sim.mcc, sim.mnc) || '?';
        _this.elements.sim.select.append(new Option(
          'Slot ' + sim.slotNr + ': ' + carrier, index
        ));
      });
      this.elements.sim.choose.removeClass('hidden');
      this.elements.submits.init.attr('disabled', true);
      this.elements.numberInput.attr('disabled', true);
      this.elements.country.choose.removeClass('action');
    },

    populateCountryNames: function () {
      var _this = this;
      this.elements.country.select.html('');
      this.countryTables.forEach(function (country) {
        var isSim = _this.selectedSimCard && country.hasMccMnc(
            _this.selectedSimCard.mcc, _this.selectedSimCard.mnc
          );
        _this.elements.country.select.append(
          new Option(country.toString(), country.get('code'), true, isSim)
        );
      });
      if (_this.selectedSimCard)  {
        this.setCountryPrefix();
      }
    },

    setSimCard: function(evt) {
      var simNumber = $(evt.target).val(),
        simCard = this.possibleSimCards[simNumber],
        country = this.countryTables.getCountryByMccMnc(
          simCard.mcc, simCard.mnc),
        carrier = '?';
      if (country) {
        carrier = country.getCarrier(simCard.mcc, simCard.mnc);
        console.log(country.get('code'));
        this.elements.country.select.val(country.get('code'));
        this.setCountryPrefix();
      }
      this.elements.sim.choose.html('Slot ' + simCard.slotNr + ': ' + carrier);
      this.selectedSimCard = simCard;
      this.elements.numberInput.removeAttr('disabled');
      this.elements.country.choose.addClass('action');
    },

    setCountryPrefix: function () {
      var code = this.elements.country.select.val(),
        country = this.countryTables.getSelectedCountry(code);
      this.elements.country.choose.html(country.get('prefix'));
      this.proposedCountry = country;
      this.elements.submits.init.removeAttr('disabled');
    },

    showCountrySelect: function (evt) {
      if (!$(evt.target).hasClass('action')) {
        return;
      }
      this.elements.country.select.focus();
    },

    showSimSelect: function () {
      this.elements.sim.select.focus();
    },

    goToConfirmation: function (evt) {
      evt.preventDefault();
      var countryCode = this.elements.country.select.val(),
        phoneParts = this._getPhoneParts(),
        _this = this,
        isValid = this._checkPhoneNumber(phoneParts, countryCode),
        useSelectedSimCard = function() {
          if (!_this.selectedSimCard) {
            return false;
          }
          if (!_this.countryTables.getCountryByMccMnc(
              _this.selectedSimCard.mcc, _this.selectedSimCard.mnc
            )) {  // we don't know this sim card at all - assume the best
            return true;
          }
          return _this.proposedCountry.hasMccMnc(
            _this.selectedSimCard.mcc, _this.selectedSimCard.mnc
          );
        };
      if (!isValid) {
        return;
      }
      var $confirmationForm = this.$el.find('#register-conf');
      $confirmationForm.find('input[name=msisdn]').val(phoneParts.number);
      $confirmationForm.find('.country-prefix').html('+' + phoneParts.prefix);
      if (useSelectedSimCard()) {
        this.mcc = this.selectedSimCard.mcc;
        this.mnc = this.selectedSimCard.mnc;
        console.log('mcc', this.mcc);
        console.log('mnc', this.mnc);
        this.next('confirmation');
      } else {
        this.populateCarriers();
        this.next('network-prompt');
      }
    },

    /**********************PAGE 2 - NETWORK SELECT - OPTIONAL***********/

    populateCarriers: function() {
      /*
       * Again, the carrier has to be selected before the network can be
       * selected
       */
      var $select = this.elements.carrier.select,
        carrierTranslation = navigator.mozL10n.get('carrier');
      this.elements.carrier.select.html('');
      Object.keys(this.proposedCountry.get('carriers')).
        map(function(carrierName) {
          $select.append(new Option(carrierName, carrierName));
        });
      this.elements.carrier.choose.html(carrierTranslation);
      this.elements.submits.network.attr('disabled', true);
    },

    setCarrier: function(evt) {
      var carrier = $(evt.target).val(),
        network = this.proposedCountry.get('carriers')[carrier][0]; //take
        // the first network
      this.elements.carrier.choose.html(carrier);
      this.mcc = network.mcc;
      this.mnc = network.mnc;
      this.elements.submits.network.removeAttr('disabled');
    },

    showCarrierSelect: function () {
      this.elements.carrier.select.focus();
    },

    networkSelected: function () {
      var stringId = 'sameNumberMultiplePhonesWarning',
        message = navigator.mozL10n.get([stringId]);
      console.log('manually chosen mcc', this.mcc);
      console.log('manually chosen mnc', this.mnc);
      window.alert(message);
      this.next('confirmation');
    },

    /*********************PAGE 3 - CONFIRMATION************************/

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
      var code = this.elements.country.select.val(),
        country = this.countryTables.findWhere({ code: code }),
        prefix = country.get('prefix').substr(1);
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
	var stringId = 'movilNumberValidationAlert';
        return window.confirm(navigator.mozL10n.get([stringId], {
          'country' : countryName,
          'number' : parts.number,
          'prefix' : parts.prefix
        }));
      }
      return true;
    },

    toggleSpinner: function () {
      this.$el.find('.spinner').toggle();
      var button = this.$el.find('input[type=submit]');
      button.prop('disabled', !button.prop('disabled'));
    },

    errorRegister: function (err, data) {
      var stringId, message;
      this.$el.find('section.intro > p').show();
      if (err === 'too_recent') {
        /*jshint -W069*/
        /*Justification: camelCase/dotstyle conflict*/
        var tryAfter = (data && data['retry_after']) || 0;
        stringId = 'registerErrorTooRecent';
        message = navigator.mozL10n.get([stringId], {
          'minutes' : Math.ceil(tryAfter / 60)
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
        message = navigator.mozL10n.get([stringId], {
          'error' : JSON.stringify(data, null, ' '),
          'version' : '{{latestTag}}'
        });
      }

      if (!message) {
        message = navigator.mozL10n.get([stringId]);
      }
      window.alert(message);
    }
  });

  return Login;
});
