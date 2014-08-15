var config = require('./config').config,
    echojs = require('echojs'),
    Q = require('q'),
    Utils = require('./utils').Utils;

var echo = echojs({
  key: config.EN_API_KEY
});

var TOTAL_ARTIST_RESULTS = 5;

/**
 * Creates a new ArtistManager.
 *
 * @param {string} genre An instance of EventEmitter.
 * @param {string} mood    A an artist descriptor.
 */
function ArtistManager(genre, mood) {

  if (!genre || !mood) {
    this.handleError(new Error('ArtistManager: requires \'genre\' and \'mood\' parameters.'));
  }

  this.genre = genre || 'blues';
  this.mood = mood || 'happy';
  this.artists = null;
}

/**
 * Requests artists from the EN artist search endpoint.
 */
ArtistManager.prototype.getArtists = function() {

  var deferred = Q.defer();

  echo('artist/search').get({
    format: 'json',
    genre: this.genre,
    mood: this.mood,
    results: TOTAL_ARTIST_RESULTS,
    callback: Utils.bustClientCache()
  }, this.handleGetArtists.bind(this, deferred));
  return deferred.promise;
};

/**
 * Handles the EN artist request.
 * @param  {Object} error  An error object.
 * @param  {Object} json Data returned from the request.
 */
ArtistManager.prototype.handleGetArtists = function(deferred, error, json) {
  if (error) {
    this.handleError(deferred, new Error(error));
    return;
  }
  this.artists = json.response.artists;
  deferred.resolve(this.artists);
};

/**
 * Handles errors.
 * @param  {Object} error  An error object.
 */
ArtistManager.prototype.handleError = function(deferred, error) {
  deferred.reject(error);
};

exports.ArtistManager = ArtistManager;
