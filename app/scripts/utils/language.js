define([], function () {
  'use strict';

  return {
    /**
     * Get the user's locale.
     * @return String representing the language version as defined
     *         in BCP 47. Examples of valid language codes
     *         include "en", "en-US", "fr", "es-ES", etc.
     */
    getLocale: function() {
      // in Gecko versions > 32 we may use `navigator.languages` to get
      // the preferred languages (see
      // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages)
      return window.navigator.language;
    },

    /**
     * Get the user's language (the first part of the locale).
     * @return String like "en", "fr", "de", etc. (always two characters)
     */
    getLanguage: function () {
      return this.getLocale().substr(0, 2);
    },

    /**
     * Get the user's locale if there is a translation for it.
     * Otherwise it returns the default language.
     */
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

      return availableToSLocales[this.getLocale()] ||
        availableToSLocales[this.getLanguage()] ||
        'en'; // not sure if 'en' is correct here, should it not be 'en-US'?
    }
  };
});
