define([], function () {
  'use strict';

  return {
    isFFOS11: function () {
      return (typeof navigator.mozTCPSocket.listen) !== 'function';
    }
  };
});
