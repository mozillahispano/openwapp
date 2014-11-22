define([
  'backbone',
  'zeptojs',
  'global',
  'templates',
  'utils/phonenumber',
  'utils/language'
], function (Backbone, $, global, templates, PhoneNumber, Language) {
  'use strict';

  var Validate = Backbone.View.extend({

    el: '#main-page',

    template: templates.validate,

    initialize: function(options) {
      this.phoneNumber = options.phoneNumber;
      this.countryCode = options.countryCode;
    },

    render: function () {
      var internationalNumber;
      var fullNumber = this.countryCode + this.phoneNumber;
      this.$el.removeClass().addClass('page validate');
      try {
        internationalNumber = PhoneNumber.format(fullNumber);
      } catch (e) {
        internationalNumber = fullNumber;
      }
      this.$el.html(this.template({ phoneNumber: internationalNumber }));
    },

    events: {
      'submit #validate-form':               'validate',
      'click button':                        'goToLogin',
      'click #call-me':                      'callMe',
      'keyup input[name=validation-code-1]': 'checkPinInput',
      'keyup input[name=validation-code-2]': 'checkPinInput'
    },

    // Validate page functions

    callMe: function (evt) {
      evt.preventDefault();
      // TODO: put right locale here
      var locale = Language.getLanguage().replace(/\-.*$/, '');
      global.auth.register(this.options.phoneNumber, locale, function () {
        // TODO: Implement callback here
      });
    },

    checkPinInput: function (evt) {
      evt.preventDefault();
      var code1 = $('input[name=validation-code-1]').val();
      var code2 = $('input[name=validation-code-2]').val();
      var button = $(evt.target).closest('form').find('input[type=submit]');
      button.prop('disabled', code1.length < 3 || code2.length < 3);
    },

    checkNameInput: function (evt) {
      evt.preventDefault();
      var name = $(evt.target).val();
      var button = $(evt.target).closest('form').find('input[type=submit]');
      button.prop('disabled', name.length < 4);
    },

    goToLogin: function (evt) {
      evt.preventDefault();
      global.router.navigate('login', { trigger: true });
    },

    validate: function (evt) {
      var _this = this;
      evt.preventDefault();

      var pin = this.$el.find('input[name=validation-code-1]').val() +
                this.$el.find('input[name=validation-code-2]').val();

      this.showSpinner('validate-page');

      global.auth.validate(
        this.options.countryCode, this.options.phoneNumber, pin, '',
        function (err) {
          _this.hideSpinner('validate-page');
          if (err) {
            window.alert(global.localisation[global.language].pinInvalidAlert);
            return;
          }
          var destination = global.auth.get('screenName') ?
                            'inbox' : 'profile';
          global.router.navigate(destination, { trigger: true });
        }
      );
    },

    showSpinner: function (section) {
      var $section = this.$el.find('#' + section);

      $section.find('.spinner').show();
      $section.find('section.intro > p').hide();
      var button = $section.find('input[type=submit]');
      button.prop('disabled', true);
    },

    hideSpinner: function (section) {
      var $section = this.$el.find('#' + section);

      $section.find('.spinner').hide();
      $section.find('section.intro > p').show();
      var button = $section.find('input[type=submit]');
      button.prop('disabled', false);
    }
  });

  return Validate;
});
