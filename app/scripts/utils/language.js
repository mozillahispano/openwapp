define([
  'global'
], function (global) {
  'use strict';

  return {
    getLanguage: function () {
      if (window.navigator.language &&
        global.localisation[window.navigator.language]) {
        return window.navigator.language;
      }
      else {
        return 'en-US';
      }
    },

    getLegalLocale: function () {
      var availableToSLocales = {
        es: 'es',
        en: 'en-US',
        'en-US': 'en-US',
        'pt-br': 'pt-br',
        pt: 'pt-br',
        it: 'it',
        de: 'de'
      };

      var lang = this.getLanguage();

      var locale = availableToSLocales[lang] ||
        availableToSLocales[lang.replace(/\-.+$/, '')] ||
        'en';

      return locale;
    }
  };
});
