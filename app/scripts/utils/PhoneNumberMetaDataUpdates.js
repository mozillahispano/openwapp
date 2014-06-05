/* global PHONE_NUMBER_META_DATA */
/* jshint maxlen: 535 */
/**
 * This file is intented to patch our current version of PhoneNumber.js.
 * 1) Brazilian numbers
 */
define(['libphonenumber/PhoneNumberMetaData'],
  function () {
    'use strict';

    // Patching brazilian numbers. The rule only allowed a "119" as a mobile
    // prefix in some cases, that we change for: ^(?:1[1-9]|2[12478])9.
    // @see: http://en.wikipedia.org/wiki/Telephone_numbers_in_Brazil#Ninth_digit_for_mobile_numbers
    PHONE_NUMBER_META_DATA[55] = '["BR","00(?:1[45]|2[135]|[34]1|43)","0","0(?:(1[245]|2[135]|[34]1)(\\d{10,11}))?","$2",,"\\d{8,11}","[1-46-9]\\d{7,10}|5\\d{8,9}",[["(\\d{4})(\\d{4})","$1-$2","[2-9](?:[1-9]|0[1-9])","$FG","NA"],["(\\d{5})(\\d{4})","$1-$2","9(?:[1-9]|0[1-9])","$FG","NA"],["(\\d{2})(\\d{5})(\\d{4})","$1 $2-$3","^(?:1[1-9]|2[12478])9","($FG)",],["(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3","[1-9][1-9]","($FG)",],["([34]00\\d)(\\d{4})","$1-$2","[34]00",,],["([3589]00)(\\d{2,3})(\\d{4})","$1 $2 $3","[3589]00","$NP$FG",]]]';
  }
);