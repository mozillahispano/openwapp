define([
  'backbone',
  'zeptojs',
  'global',
  'underscore',
  'templates',
  'vendor/async-storage/async-storage',
  'storage/dbmanager',
  'utils/language'
], function (Backbone, $, global, _, templates,
  AsyncStorage, DbManager, Language) {
  'use strict';

  var Settings = Backbone.View.extend({
    el: '#main-page',

    template: templates.settings,

    tosPage : templates.tos,

    privacyPage : templates.privacy,

    events: {
      'click #unregister' : 'unregister',
      'click #showToS' :    'showTerms',
      'click #showPrivacy': 'showPrivacy',
      'click .btn-back':    'showSettings'
    },

    initialize: function () {
    },

    showSettings: function () {
      this.$el.removeClass().addClass('page settings');
    },

    showTerms: function (evt) {
      evt.preventDefault();
      if (this.$el.find('#tos-body').is(':empty')) {
        this.$el.find('#tos-body').html(this.tosPage({
          tosLocale: Language.getLegalLocale()
        }));
      }
      this.$el.removeClass().addClass('page tos');
    },

    showPrivacy: function (evt) {
      evt.preventDefault();
      if (this.$el.find('#privacy-body').is(':empty')) {
        this.$el.find('#privacy-body').html(this.privacyPage({
          tosLocale: Language.getLegalLocale()
        }));
      }
      this.$el.removeClass().addClass('page privacy');
    },

    unregister: function (evt) {
      evt.preventDefault();

      // TODO: localise this string
      if (window.confirm(global.localisation[global.language]
        .logoutAlertText)) {
        this._unregisterDevice();
      }
    },

    render: function () {
      this.$el.html(this.template({ version: global.client.getAppVersion() }));
      this.showSettings();
    },

    _unregisterDevice: function () {
      global.auth.logout();
      this._destroyAsyncStorage(_.bind(this._destroyOtherData, this));
    },

    _destroyOtherData: function () { // TODO: add spinning wheel
      var _this = this;
      this._destroyMemory();
      _this._destroyIndexedDb(_.bind(_this._reloadAndLogin, _this), true);
    },

    _destroyMemory: function () {
      global.contacts.unregister();
      global.historyCollection.unregister();
    },

    _reloadAndLogin: function () {
      global.router.navigate('login', { trigger: true });
      window.location.reload(true);
    },

    _destroyAsyncStorage: function (callback) {
      AsyncStorage.clear(callback);
    },

    _destroyIndexedDb: function (callback) {
      DbManager.destroySchema(callback);
    }

  });

  return Settings;
});
