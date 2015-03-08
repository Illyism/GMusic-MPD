#!/usr/bin/env node

var komponist = require('komponist'),
    program = require("commander"),
    fs = require("fs"),
    path = require("path"),
    pkg = require("./package.json");

var YLW = "\033[1;33m",                        // Terminal ANSI Color
    RES = "\033[0m",                           // Reset ANSI
    RED = "\033[1;31m";                           // Reset ANSI

var program = require('commander');

program
  .version(pkg.version);

program
  .usage('[options] <playlist>')
  .option('-d, --directory <directory>', 'The playlists directory, (ex: ~/.mpd/playlists)')
  .option('-e, --ext [extension]', 'The playlist extension [default: .m3u]', ".m3u")
  .option('-h, --host [host]', 'MPD Server Hostname or IP', "localhost")
  .option('-p, --port [port]', 'MPD Server Port', "6600")
  .option('-c, --check', 'List songs in the playlist')
  .option('-l, --list', 'Display playlists in directory')
  .option("-r, --reload", "Clear and load the playlist")
  .option("--play [position]", "Play the song in the playlist", "0")

program.parse(process.argv);

if (!program.directory) {
  console.error("  %sERROR:%s Specify a playlists directory", RED, RES);
  console.log(" Example: gmusic-mpd -d ~/.mpd/playlists <playlist>");
  return program.help();
}

if (program.list) {
  return showPlaylists();
}


if (!program.args.length) {
  console.error('%sERROR:%s Specify a playlist', RED, RES);
  console.log("\nAvailable playlists: ");
  showPlaylists();
  return program.help();
}
var playlist_name = program.args.join(" ");


playlist = path.resolve(program.directory, playlist_name+program.ext);
console.log("Reading playlist: %s%s%s", YLW, playlist, RES);

fs.readFile(playlist, function(err, file) {
  if (err) {
    console.error("%s%s%s", RED,err,RES);
    console.log("\nAvailable playlists: ");
    return showPlaylists();
  }

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

  console.log("Connecting to %s%s:%s%s", YLW, program.host, program.port, RES);
  var client = komponist.createConnection(program.port, program.host, function() {
   
      if (program.reload) {
        return client.clear(function() {
          client.load(playlist_name, function(err) {
            if (err) {
              console.error("%s%s %s %s", RED, err, playlist_name, RES);
              console.log("\nAvailable playlists: ");
              return client.listplaylists(function(err, playlists) {
                if (err) return console.error("%s%s%s", RED, err, RES);
                playlists.forEach(function(file) {
                  console.log(" - %s", file.playlist);
                });
                process.exit(1);
              });
            }

            addTags(client, songs);
            if (program.play) client.play(program.play);
          })
        });
      }

      addTags(client, songs);
  });
});

function showPlaylists() {
  try {
    fs.readdirSync(program.directory).filter(function(file) {
      return path.extname(file) == program.ext;
    }).map(function(file) {
      return path.basename(file, program.ext);
    }).forEach(function(file) {
      console.log(" - %s", file);
    })
  } catch(err) {
    console.error("%s%s%s", RED, err, RES);
  }
}


function addTags(client, songs) {
  client.playlistinfo(function(err, info) {
    if (err) return console.error(err);

    console.log("Songs in playlist: \033[1;33m%s", YLW, info.length, RES);
    info.forEach(function(song) {
      var m3u = songs.filter(function(i) {return i.file == song.file})[0];
      if (!m3u) return;
      client.cleartagid(song.Id);
      client.addtagid(song.Id, "Artist", m3u.artist);
      client.addtagid(song.Id, "Title", m3u.title);
      client.addtagid(song.Id, "Album", m3u.album);
    });
    if (program.check) check(client);
    else process.exit(0);
  });
}

function check(client) {
  client.playlistinfo(function(err, info) {
    info.forEach(function(song) {
      console.log("%s %s %s %s",
        song.Artist,
        YLW, song.Title, RES);
    });
    process.exit(0);
  });
}