/* exported hoodieOpen */
/* global hoodieRemoteStore */

// Open stores
// -------------
var hoodie = require('../hoodie');

module.exports = function hoodieOpen() {
  var $extend = window.jQuery.extend;

  // generic method to open a store. Used by
  //
  // * hoodie.remote
  // * hoodie.user("joe")
  // * hoodie.global
  // * ... and more
  //
  //     hoodie.open("some_store_name").findAll()
  //
  function open(storeName, options) {
    options = options || {};

    $extend(options, {
      name: storeName
    });

    return hoodieRemoteStore(hoodie, options);
  }

  //
  // Public API
  //
  return open;
};

