define([], function () {
  'use strict';

  var DEFAULT_MAX_SIZE = 120;

  return {
    setMaxSize: function (maxSize) {
      this.maxSize = maxSize;
    },
    generate: function (imageBlob, callback, options) {
      options = options || {};
      var maxSize = this.maxSize || DEFAULT_MAX_SIZE;

      var fileReader = new FileReader();
      fileReader.readAsDataURL(imageBlob);

      fileReader.onload = function (evt) {
        var img = document.createElement('img');

        img.onload = function () {
          var width = img.width,
              height = img.height;

          var scale = Math.min(maxSize / Math.max(height, width), 1);

          var c = document.createElement('canvas');
          c.width = width * scale;
          c.height = height * scale;

          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, width * scale, height * scale);

          if (options.asBlob) {
            c.toBlob(callback.bind(null, null), 'image/jpeg');
          } else {
            callback(null, c.toDataURL('image/jpeg').split('base64,')[1]);
          }
        };

        img.onerror = function (err) {
          callback(err);
        };

        // The `src` of the image should be set after the event handler
        img.src = evt.target.result;
      };

      fileReader.onerror = function (evt) {
        callback(evt);
      };
    }
  };
});
