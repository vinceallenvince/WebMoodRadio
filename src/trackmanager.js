var config = require('./config').config,
    Q = require('q'),
    Utils = require('./utils').Utils;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: config.SPOTIFY_API_CLIENT_ID,
  clientSecret: config.SPOTIFY_API_CLIENT_SECRET
});

/**
 * Creates a new PlaylistManager.
 *
 * @param {Object} artists An array of artists.
 */
function TrackManager() {}

/**
 * Requests a track from the SP Web api.
 * @param  {number} index The current playlist position.
 */
TrackManager.prototype.getTrack = function(song) {

  var deferred = Q.defer();

  if (!song.tracks.length || !song.tracks[0].foreign_id) {
    this.handleError(deferred, new Error('TrackManager.getTrack: song has no vaild foreign id.'));
    return;
  }

  var foreign_id = song.tracks[0].foreign_id;
  var track_id = foreign_id.replace('spotify:track:', '');
  spotifyApi.getTrack(track_id)
      .then(this.handleGetTrack.bind(this, deferred), this.handleError.bind(this, deferred));

  return deferred.promise;
};

/**
 * Handles a succesful track request.
 * @param  {Object} data Track data.
 */
TrackManager.prototype.handleGetTrack = function(deferred, data) {
  if (data.preview_url) {
    deferred.resolve(data.preview_url);
  } else {
    this.handleError(deferred, new Error('TrackManager.handleGetTrack: preview_url is invalid.'));
  }
};

/**
 * Handles errors.
 * @param  {Object} error  An error object.
 */
TrackManager.prototype.handleError = function(deferred, error) {
  deferred.reject(error);
};
exports.TrackManager = TrackManager
