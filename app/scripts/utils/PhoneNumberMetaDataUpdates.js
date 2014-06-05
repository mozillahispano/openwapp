/* global PHONE_NUMBER_META_DATA */
/**
 * This file is intented to patch our current version of PhoneNumber.js.
 * 1) Brazilian numbers
 * 2) Venezuelan numbers
 */
define(['libphonenumber/PhoneNumberMetaData'],
  function () {
    'use strict';

    // Patching brazilian numbers
    var brazil = PHONE_NUMBER_META_DATA[55];
    var patched = brazil.replace(',"119",', ',"^(?:1[1-9]|2[12478])9",');
    PHONE_NUMBER_META_DATA[55] = patched;
    // Patching Venezuela numbers
  }
);