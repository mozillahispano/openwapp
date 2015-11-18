define([], function () {
  'use strict';

  return {
    getLanguage: function () {
      // TODO: we are comparing to 'en-US' until we find a way to get
      // all available translations from l10n.js
      if (window.navigator.language && 'en-US' === window.navigator.language) {
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
        de: 'de',
        nl: 'nl'
      };

      var lang = this.getLanguage();

      var locale = availableToSLocales[lang] ||
        availableToSLocales[lang.replace(/\-.+$/, '')] ||
        'en';

      return locale;
    }
  };
});
