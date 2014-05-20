define([
  'vendor/coseme-client/client'
], function (cosemeClient) {
  'use strict';

  var client = cosemeClient.init();

  return {
    maxStoredMessages: 300, // Number of messages stored before they are removed
    client: client,
    mapsAppCode : 'qkRqH6Iz3yKMrcflO44pZA',
    mapsAppId: 'CaXtXWGiQ1gicvatQdwy',
    gpsTimeout: 60000, //60 sec timeout to get current position
    httpTimeout: 30000,
    maxImageWidth: 900,
    maxImageHeight: 1200
  };
});
