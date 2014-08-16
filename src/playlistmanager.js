var config = require('./config').config,
    echojs = require('echojs'),
    moods = require('./moods').moods,
    Q = require('q'),
    Utils = require('./utils').Utils;

var echo = echojs({
  key: config.EN_API_KEY
});

var TOTAL_ARTIST_RESULTS = 5;
var TOTAL_PLAYLIST_RESULTS = 5; // Could adjust this based on bandwidth

/**
 * Creates a new PlaylistManager.
 *
 * @param {Object} artists An array of artists.
 */
function PlaylistManager() {
  this.artists = null;
}

/**
 * Creates a dynamic playlist session from the EN playlist endpoint.
 */
PlaylistManager.prototype.createPlaylistSession = function(artists) {

  if (!artists) {
    this.handleError(new Error('PlaylistManager: requires \'artists\' parameter.'));
  }

  var deferred = Q.defer();

  this.artists = artists;

  var l = this.artists.length;
  var artist_seeds = [];
  for (var i = 0; i < l; i++) {
    artist_seeds.push(this.artists[i].id);
  }

  echo('playlist/dynamic/create').get({
    format: 'json',
    results: 1,
    type: 'artist',
    artist: artist_seeds,
    target_tempo: Utils.map(this.index, 0, moods.length - 1, 500, 0),
    target_danceability: Utils.map(this.index, 0, moods.length - 1, 1, 0),
    target_energy: Utils.map(this.index, 0, moods.length - 1, 1, 0),
    song_selection: this.index < moods.length / 2 ? 'valence-top' : 'valence-bottom',
    variety: 1,
    adventurousness: 1,
    distribution: 'wandering',
    bucket: ['id:spotify', 'tracks'],
    callback: Utils.bustClientCache()
  }, this.handleCreatePlaylistSession.bind(this, deferred));

  return deferred.promise;
};

/**
 * Handles the EN create playlist session request.
 * @param  {Object} err  An error object.
 * @param  {Object} json Data returned from the request.
 */
PlaylistManager.prototype.handleCreatePlaylistSession = function(deferred, error, json) {

  if (error) {
    this.handleError(deferred, new Error(error));
    return;
  }

  this.session_id = json.response.session_id;
  this.initialSong = json.response.songs[0];

  deferred.resolve(this.initialSong);
};

/**
 * Requests a playlist from the EN playlist endpoint.
 * @param {number} index A channel index.
 * @return {Object} A promise.
 */
PlaylistManager.prototype.getNextSongs = function(index) {

  console.log('Channel %d requesting %d new songs.', index, TOTAL_PLAYLIST_RESULTS);

  var deferred = Q.defer();

  echo('playlist/dynamic/next').get({
    format: 'json',
    session_id: this.session_id,
    results: TOTAL_PLAYLIST_RESULTS,
    callback: Utils.bustClientCache()
  }, this.handleGetNextSongs.bind(this, deferred));

  return deferred.promise;
};

/**
 * Handles the EN get next songs request.
 * @param  {Object} deferred A Q deferred.
 * @param  {Object} error  An error object.
 * @param  {Object} json Data returned from the request.
 */
PlaylistManager.prototype.handleGetNextSongs = function(deferred, error, json) {

  if (error) {
    this.handleError(deferred, new Error(error));
    return;
  }

  deferred.resolve({
    songs: json.response.songs
  });
};

/**
 * Handles errors.
 * @param  {Object} error  An error object.
 */
PlaylistManager.prototype.handleError = function(deferred, error) {
  deferred.reject(error);
};

exports.PlaylistManager = PlaylistManager;
