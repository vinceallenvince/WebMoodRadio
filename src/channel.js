var Q = require('q'),
    ArtistManager = require('./artistmanager.js').ArtistManager,
    PlaylistManager = require('./playlistmanager.js').PlaylistManager,
    TrackManager = require('./trackmanager.js').TrackManager,
    moods = require('./moods').moods,
    Player = require('player');

var ARTIST_GENRE = 'blues';

/**
 * Creates a new Channel.
 *
 * @param {string} genre An instance of EventEmitter.
 * @param {string} mood    A an artist descriptor.
 */
function Channel(emitter, mood, index) {
;
  if (!emitter || !mood || typeof index === 'undefined') {
    this.fail(new Error('Channel: requires \'emitter\', \'mood\' and \'index\' parameters.'));
  }

  this.emitter = emitter;
  this.mood = mood;
  this.index = index;
  this.initialTrack = null;
  this.player = null;
  this.fetching = false;
  this.active = false;
}

Channel.prototype.init = function() {

  this.artistMgr = new ArtistManager(ARTIST_GENRE, this.mood);
  this.playlistMgr = new PlaylistManager();
  this.trackMgr = new TrackManager();

  Q.fcall(this.artistMgr.getArtists.bind(this.artistMgr)).
  then(this.playlistMgr.createPlaylistSession.bind(this.playlistMgr)).
  then(this.trackMgr.getTrack.bind(this.trackMgr)).
  then(Channel.checkPreload.bind(this, this.mood)).
  fail(this.fail.bind(this)).
  done();
};

Channel.ready = false;

Channel.records = {
  list: [],
  lookup: {}
};

Channel.checkPreload = function(mood, initialTrack) {

  this.initialTrack = initialTrack;

  this.player = new Player(this.initialTrack, {
    cache: true,
    downloads: './cache'
  });

  if (!Channel.records.lookup.mood) {
    Channel.records.lookup[mood] = true;
    Channel.records.list.push(mood);
    console.log('ready: ' + mood.toUpperCase());
  }

  if (Channel.records.list.length === moods.length) {
    Channel.ready = true;
    this.emitter.emit('channelsReady');
    console.log('ALL READY!');
  }
};

Channel.prototype.playNextTrack = function() {
  if (!this.hasDoneCallback) {
    this.player.play(this.playNextTrack.bind(this));
    this.hasDoneCallback = true;
  } else if (this.active) {
    this.player.next(this.checkNextTrack.bind(this));
  }
};

/**
 * Checks if player returned an Error object.
 * @param  {Object} noTracks If player has no tracks to play, it returns an Error object.
 */
Channel.prototype.checkNextTrack = function(noTracks) {
  if (noTracks && !this.fetching) {
    Q.fcall(this.playlistMgr.getNextSongs.bind(this.playlistMgr)).
      fail(this.fail.bind(this)).
      done(this.getTracks.bind(this));
  }
};

Channel.prototype.getTracks = function(data) {

  var promises = [];

  if (!data) { // TODO: threw an error; cannot read property 'songs' of undefined
    return;
  }

  this.fetching = true;

  for (var i = 0, max = data.songs.length; i < max; i++) {
    var song = data.songs[i];
    promises.push(this.trackMgr.getTrack(song));
  }

  var allPromise = Q.all(promises);
  allPromise.
    then(this.addTracks.bind(this)).
    fail(this.fail.bind(this)).
    done(this.playNextTrack.bind(this));
};

Channel.prototype.addTracks = function(data) {
  for (var i = 0, max = data.length; i < max; i++) {
    if (data[i]) {
      this.player.add(data[i]);
      this.player.download(data[i], this.handleDownload.bind(this));
    }
  }
  this.fetching = false;
};

Channel.prototype.handleDownload = function(error, fileStream) {
  if (error) {
    this.fail(new Error(error));
  }
};

Channel.prototype.fail = function(error) {
  console.error(error);
  this.fetching = false;
};

exports.Channel = Channel;
