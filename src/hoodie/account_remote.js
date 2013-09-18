/* global open:true */

// AccountRemote
// ===============

// Connection / Socket to our couch
//
// AccountRemote is using CouchDB's `_changes` feed to
// listen to changes and `_bulk_docs` to push local changes
//
// When hoodie.remote is continuously syncing (default),
// it will continuously  synchronize with local store,
// otherwise sync, pull or push can be called manually
//
var open = require('./open');
var account = require('./account');
var store = require('./store');
var events = require('./events');
var config = require('./config');

module.exports = function () {

  // inherit from Hoodies Store API
  var remote = open(account.db(), {

    // we're always connected to our own db
    connected: true,

    // do not prefix files for my own remote
    prefix: '',

    //
    since: sinceNrCallback,

    //
    defaultObjectsToPush: store.changedObjects,

    //
    knownObjects: store.index().map( function(key) {
      var typeAndId = key.split(/\//);
      return { type: typeAndId[0], id: typeAndId[1]};
    })
  });

  // trigger
  // ---------

  // proxies to hoodie.trigger
  remote.trigger = function trigger() {
    var eventName;

    eventName = arguments[0];

    var parameters = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];

    return events.trigger.apply(['remote:' + eventName].concat(Array.prototype.slice.call(parameters)));
  };


  // on
  // ---------

  // proxies to hoodie.on
  remote.on = function on(eventName, data) {
    eventName = eventName.replace(/(^| )([^ ]+)/g, '$1'+'remote:$2');
    return events.on(eventName, data);
  };


  // unbind
  // ---------

  // proxies to hoodie.unbind
  remote.unbind = function unbind(eventName, callback) {
    eventName = eventName.replace(/(^| )([^ ]+)/g, '$1'+'remote:$2');
    return events.unbind(eventName, callback);
  };


  // Private
  // ---------

  // getter / setter for since number
  //
  function sinceNrCallback(sinceNr) {
    if (sinceNr) {
      return config.set('_remote.since', sinceNr);
    }

    return config.get('_remote.since') || 0;
  }

  //
  // subscribe to events coming from account
  //
  function subscribeToEvents() {

    events.on('remote:connect', function() {
      events.on('store:idle', remote.push);
      remote.push();
    });

    events.on('remote:disconnect', function() {
      events.unbind('store:idle', remote.push);
    });

    events.on('disconnected', remote.disconnect);
    events.on('reconnected', remote.connect);

    // account events
    events.on('account:signin', function() {
      remote.connect(account.db());
    });

    events.on('account:reauthenticated', remote.connect);
    events.on('account:signout', remote.disconnect);
  }

  // allow to run this once from outside
  remote.subscribeToEvents = function() {
    subscribeToEvents();
    delete remote.subscribeToEvents;
  };

  return remote;

};
