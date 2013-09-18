/* exported hoodieDispose */

// hoodie.dispose
// ================
var hoodie = require('../hoodie');

module.exports = function hoodieDispose () {

  // if a hoodie instance is not needed anymore, it can
  // be disposed using this method. A `dispose` event
  // gets triggered that the modules react on.
  function dispose() {
    hoodie.trigger('dispose');
    hoodie.unbind();
  }

  //
  // Public API
  //
  return dispose;
};
