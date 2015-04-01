## GMusic-MPD

Helper script for GMusicProxy together with MPD.
Adds Extended M3U data temporarily to the current playlist

You can use Google Play Music - All Access with the correct extended m3u data using [Music Player Daemon](http://www.musicpd.org/).

This is not limited to GMusicProxy however. It depends on how the m3u data is written.

- [Usage](#)
- [Options](#)
- [Commands](#)
- [Examples](#)
	- [Set the tags](#)
	- [Reload and Play](#)
	- [Fetch a playlist](#)
	- [I'm Feeling Lucky](#)


## [GMusicProxy](http://gmusicproxy.net/)

I'm assuming that you are using this application and have the `--extended-m3u` option set. You can also specify it in your `gmusixproxy.cfg` like this:

```
email=hello@illyism.com
password=password
extended-m3u=true
daemon=true
```

But this tool only interfaces with the saved playlists on the system for the moment. So it doesn't connect with GMusicProxy.

## Usage

Use this tool to load a playlist and grab the m3u data.
And send it to MPD.

You need [Iojs](https://iojs.org/en/index.html) or [Node](https://nodejs.org/). Then install globally with NPM.

```
npm install -g gmusic-mpd
```


```

Usage: gmusic-mpd [options] <playlist>

Options:

  -h, --help                   output usage information
  -V, --version                output the version number
  -d, --directory <directory>  The playlists directory, (ex: ~/.mpd/playlists)
  -e, --ext [extension]        The playlist extension [default: .m3u]
  -h, --host [host]            MPD Server Hostname or IP
  -p, --port [port]            MPD Server Port
  -c, --check                  List songs in the playlist
  -l, --list                   Display playlists in directory
  -r, --reload                 Clear and load the playlist
    --play [position]            Play the song in the playlist
  -f, --fetch <artist>         Download the playlist for an artist from GMusicProxy
    --gmusic <host:port>         The host and port of GMusicProxy
    --tracks <tracks>            Amount of songs to fetch

  --ifl                        Grabs the I'm feeling Lucky Playlist




```


## Options

> -d --directory

**Always required.** The directory of all the playlist files. Usually this is `~/.mpd/playlists`. Look at your `mpd.conf`.


> -e --ext

Default: `.m3u`. The extension of your playlist file.


> -h --host

Default: `localhost`. The hostname or IP of your MPD server.


> -p --port

Default: `6600`. The MPD port.


## Commands

> -l --list

Lists all the playlists in the directory.

---

> -r --reload

Clear the current playlist completely and load the specified playlist. It doesn't play yet.

> --play [position]

Plays the first song or the song specified as the argument.

---

> -f --fetch

Fetches the artist playlist from GMusicProxy and saves it to the playlist in the playlists directory.

> --tracks <amount>

Default: `100`. The amount of tracks for GMusicProxy to fetch.

> --gmusic <host:port>

Default: `localhost:9999`. The address of the GMusicProxy service.

---

> --ifl

Grabs the I'm Feeling Lucky playlist.

## Examples

### Set the tags

Done on localhost. Looks at the `/var/lib/mpd/playlists/explosions in the sky.m3u` file and compares the files in the current playlist and adds where it can.

```

gmusic-mpd -d /var/lib/mpd/playlists explosions in the sky

```

### Reload and Play

Connects to the MPD server running on `192.168.1.100` and reloads and plays the first song in the Ratatat playlist.

```

gmusic-mpd -h 192.168.1.100 -d /var/lib/mpd/playlists -r --play ratatat

```


### Fetch a playlist

You can download the playlist by searching for the artist and saving it in the playlists directory. If you specify the reload option it will also load the newly created playlist.

```bash
# Get a playlist for the artist Queen and save it
gmusic-mpd -d /var/lib/mpd/playlists queen -f Queen

# Get a 200 songs playlist and load the 5th track
gmusic-mpd -d /var/lib/mpd/playlists queen -f Queen -r --play 5 --tracks 200

```


### I'm Feeling Lucky

You can grab automatic "I'm feeling lucky" playlist.

```bash
# Get IFL playlist and save it in lucky.m3u and play it
gmusic-mpd -d /var/lib/mpd/playlists --ifl -r --play

```

