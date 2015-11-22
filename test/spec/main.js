require.config({
  baseUrl: window.coverage ? 'cov/': 'scripts/',
  paths: {
    zeptojs: '../components/zepto/zepto.min',
    underscore: '../components/underscore/underscore-min',
    backbone: '../components/backbone/backbone-min',
    handlebars: '../components/handlebars.js/dist/handlebars.runtime',
    rtc: 'vendor/ottcomms-rtc-web/rtc',
    libphonenumber: '../components/PhoneNumber.js'
  },
  shim: {
    'zeptojs': {
      exports: '$'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'zeptojs'],
      exports: 'Backbone'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
    'rtc/rtc': {
      exports: 'RTC',
      deps: ['rtc/sip', 'rtc/connection']
    },
    'libphonenumber/PhoneNumber': {
      exports: 'PhoneNumber',
      deps: ['libphonenumber/PhoneNumberMetaData']
    },
    'vendor/async-storage/async-storage': {
      exports: 'asyncStorage'
    },
    'lib/JSCovReporter/JSCovReporter.js': {
      deps: ['backbone']
    }
  }
});

/* jshint maxstatements: 50 */
require([
  'backbone',
  'global',
  'templates/helpers',
  'lib/JSCovReporter/JSCovReporter.js'
], function (Backbone, global, HandlebarsHelpers) {
  'use strict';
  // Create global objects so they can be easily stubbed in the tests
  global.router = new Backbone.Router({ show: function () {} });
  global.router.navigate = function () {};
  global.auth = new Backbone.Model();
  global.auth.checkCredentials = function () {};
  global.auth.checkAppVersion = function () {};
  global.auth.register = function () {};
  global.auth.validate = function () {};
  global.auth.updateScreenName = function () {};
  global.auth.login = function () {};
  global.auth.logout = function () {};
  global.auth._oldAppVersion = function () {};
  global.auth.showMessageUpdateNeeded = function () {};
  global.contacts = new Backbone.Collection();
  global.contacts.unregister = function () {};
  global.contacts.getTumeContacts = function ()
                                      { return new Backbone.Collection(); };
  global.notifications = new Backbone.Model();
  global.notifications.send = function () {};

  global.rtc = new Backbone.Model();
  global.rtc.sendMessage = function () {};
  global.rtc.sendDeliveredNotification = function () {};

  // TODO: a better way to initialize methods
  global.historyCollection = new Backbone.Collection();
  global.historyCollection.todaysConversations = function () {};
  global.historyCollection.yesterdayConversations = function () {};
  global.historyCollection.olderConversations = function () {};
  global.historyCollection.loadConversations = function () {};
  global.historyCollection.saveConversationList = function () {};
  global.historyCollection.findAndCreateConversation = function () {};
  global.historyCollection.clear = function () {};
  global.historyCollection.unregister = function () {};
  global.historyCollection.comparator = function () { return -1; };

  global.geoPosition = new Backbone.Model();

  global.historyFetcher = new Backbone.Model();
  global.historyFetcher.fetchMessages = function () {};

  global.language = 'es';

  HandlebarsHelpers.register();
});
/* jshint maxstatements: 20 */
