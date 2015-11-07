define([
  'vendor/coseme-client/client',
  'fxosrate'
], function(cosemeClient) {
  'use strict';

  // Initialize FirefoxOS Rate library
  window.fxosRate = Object.create(window.fxosRate);
  var fxosRateOpts = {
    daysUntilPrompt: 10,
    usesUntilPrompt: 5,
    eventsUntilPrompt: 5,
    remindPeriod: 7
  };
  window.fxosRate.init('openwapp', '{{latestTag}}', fxosRateOpts);

  var client = cosemeClient.init();

  return {
    maxStoredMessages: 300, // Number of messages stored before they are removed
    client: client,
    mapsAppCode: 'qkRqH6Iz3yKMrcflO44pZA',
    mapsAppId: 'CaXtXWGiQ1gicvatQdwy',
    gpsTimeout: 60000, //60 sec timeout to get current position
    httpTimeout: 30000,
    maxImageWidth: 900,
    maxImageHeight: 1200
  };
});
