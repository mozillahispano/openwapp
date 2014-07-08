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
      var quality = options.quality || 0.8;
      var forceSquare = options.forceSquare || false;

      var fileReader = new FileReader();
      fileReader.readAsDataURL(imageBlob);

      fileReader.onload = function (evt) {
        var img = document.createElement('img');

        img.onload = function () {
          var width = img.width,
              height = img.height;

          var scale = Math.min(maxSize / Math.max(height, width), 1);
          var ratio = width / height;

          var c = document.createElement('canvas');
          var newWidth = width * scale;
          var newHeight = height * scale;
          if (forceSquare) {
            c.width = Math.max(newWidth, newHeight);
            c.height = c.width;
          }
          else {
            c.width = newWidth;
            c.height = newHeight;
          }

          var ctx = c.getContext('2d');
          var offsetX = (c.width - newWidth) / 2;
          var offsetY = (c.height - newHeight) / 2;
          ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

          if (options.asBlob) {
            c.toBlob(function (blob) {
              callback(null, blob, ratio);
            }, 'image/jpeg', quality);
          } else {
            callback(
              null, c.toDataURL('image/jpeg').split('base64,')[1], ratio);
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
