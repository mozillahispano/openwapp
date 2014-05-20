define([], function () {
  'use strict';

  function getFrom(object, keys) {
    if (keys.length === 0 || object === null || object === undefined) {
      return object;
    }
    var currentKey = keys.shift();
    var nextObject = object[currentKey];
    return getFrom(nextObject, keys);
  }

  return {
    interpolate: function (string, object) {
      return string.replace(/{{\s*(\S+)\s*}}/g, function (_, key) {
        var replacement;
        if (key) { replacement = getFrom(object, key.split('.')); }
        else { replacement = object + ''; }
        return replacement;
      });
    }
  };
});
