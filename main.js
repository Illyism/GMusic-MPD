var komponist = require('komponist'),
    fs = require("fs"),
    path = require("path");

var PLAYLIST_LOCATION = "/mnt/mpd/playlists/", // Location of the playlist files
    PLAYLIST_EXTENSION = ".m3u",               // Extension of the playlist files
    COLOR = "\033[1;33m",                      // Terminal ANSI Color
    BLANK = "\033[0m",                         // Reset ANSI
    HOST = "pc",                               // MPD Server Hostname or IP
    PORT = "6600",                             // MPD Server Port
    DO_CHECK = false;                          // Show all the songs in the playlist

var playlist = process.argv[process.argv.length - 1];
if (__filename == playlist)
  return console.error('%sERROR:%s Specify a playlist\n\
   Example: GMusic-MPD "kaiser chiefs"', COLOR, BLANK);
playlist = path.resolve(PLAYLIST_LOCATION, playlist+PLAYLIST_EXTENSION);
console.log("Reading playlist: \033[1;33m%s", COLOR, playlist, BLANK);

fs.readFile(playlist, function(err, file) {
  if (err) return console.error(err);

  var songs = file.toString()
    .split("#EXTINF")
    .slice(1)
    .map(function(song) {
      var trim = song.trim().split("\n");
      trim[0] = trim[0].slice(1);
      song = trim[0]
        .split(",", 2)[1] // Strip the time part as you can't set this
        .split(" - "); // GMusixProxy returns Title - Artist - Album
      return {
        file: trim[1],
        extm3u: trim[0],
        song: song,
        artist: song[0],
        title: song[1],
        album: song[2]
      };
    });

  var client = komponist.createConnection(PORT, HOST, function() {
    client.playlistinfo(function(err, info) {
      console.log("Songs in playlist: \033[1;33m%s", COLOR, info.length, BLANK);
      info.forEach(function(song) {
        var m3u = songs.filter(function(i) {return i.file == song.file})[0];
        if (!m3u) return;
        client.cleartagid(song.Id);
        client.addtagid(song.Id, "Artist", m3u.artist);
        client.addtagid(song.Id, "Title", m3u.title);
        client.addtagid(song.Id, "Album", m3u.album);
      });
      if (DO_CHECK) check(client);
      else process.exit();
    });
  });
});

function check(client) {
  client.playlistinfo(function(err, info) {
    info.forEach(function(song) {
      console.log("%s %s %s %s",
        song.Artist,
        COLOR, song.Title, BLANK);
    });
    process.exit();
  });
}