#WebMoodRadio

Play 30 second previews from a specific genre across a range of moods using the [EchoNest API](http://developer.echonest.com) and [Spotify Web API](https://developer.spotify.com).

##Install

Clone this repo.
```
git clone https://github.com/vinceallenvince/WebMoodRadio
```

Run npm install.
```
npm install
```

Create a src/config.js that contains your Echo Nest and Spotify API credentials. It should look like this.
```
var config = {
  EN_API_KEY: 'YOUR_ECHO_NEST_API_KEY',
  SPOTIFY_API_CLIENT_ID: 'YOUR_SPOTIFY_API_CLIENT_ID',
  SPOTIFY_API_CLIENT_SECRET: 'YOUR_SPOTIFY_API_CLIENT_SECRET'
}

exports.config = config;
```

##Usage

Turn on your speakers. Run the app.
```
node main
```

Use your 'left' and 'right arrow keys to navigate the channels. To change the range of moods, edit [src/moods](https://github.com/vinceallenvince/WebMoodRadio/blob/master/src/moods.js).

The genre is hardcoded as the Echo Nest 'Blues' genre. To change the genre, edit [src/channel.js](https://github.com/vinceallenvince/WebMoodRadio/blob/master/src/channel.js#L8). You can find a [full list](http://developer.echonest.com/api/v4/genre/list?api_key=UQZFWAPECBUEJSNX6&format=json&results=1500) of genres via the Echo Nest API.
