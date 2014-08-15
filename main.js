var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

var serviceStarted = false;

// Build channels
//
var Channel = require('./src/channel').Channel,
    moods = require('./src/moods').moods;

var channels = [];
var channelIndex = 0;
var changeChannelTimeout = null;

function buildChannels() {
  if (!serviceStarted) {
    for (var i = 0; i < moods.length; i++) {
      channels.push(new Channel(emitter, moods[i].name, i));
      channels[channels.length - 1].init();
    }
  }
  serviceStarted = true;
}

function getFirstAvailableChannel(channels) {

  for (var i = 0; i < channels.length; i++) {
    var channel = channels[i];
    if (channel.initialTrack) {
      return channel;
    }
  }
  return false;
}

function stopAllChannels() {
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].player) {
      channels[i].player.stop();
    }
    channels[i].active = false;
  }
}

emitter.on('channelsReady', function() {

  var firstChannel = getFirstAvailableChannel(channels);

  if (firstChannel) {
    firstChannel.active = true;
    firstChannel.playNextTrack();
    console.log('playing channel: ' + firstChannel.index);
  } else {
    console.log('Error: no channels available.');
  }
});

emitter.on('changeChannel', function(data) {

  var nextChannel = channels[data.channelIndex];

  stopAllChannels();

  clearTimeout(changeChannelTimeout);

  changeChannelTimeout = setTimeout(function () {
    nextChannel.active = true;
    nextChannel.playNextTrack();
  }, 500);

  console.log('playing channel: ' + nextChannel.index);
});

buildChannels();


// PYTHON-SHELL
//

var PythonShell = require('python-shell');

var options = {
  scriptPath: './'
};

var pyshell = new PythonShell('./my_script.py', options);

// sends a message to the Python script via stdin
pyshell.send('hello');

pyshell.on('message', function (message) {
  // received a message sent from the Python script (a simple "print" statement)
  console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished, bye from Python!');
});



// KEYPRESS

var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {

  //console.log('got "keypress"', key);

  if (key.name === 'right' && channelIndex < channels.length - 1) {

    channelIndex++;
    emitter.emit('changeChannel', {
      channelIndex: channelIndex
    });
  } else if (key.name === 'left' && channelIndex > 0) {
    channelIndex--;
    emitter.emit('changeChannel', {
      channelIndex: channelIndex
    });
  }

  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

