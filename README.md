# flowplayer-vast
VAST 2.0 support within Flowplayer 6 HTML

**Note**: This project is a work in progress and may not fulfill all of the VAST 2.0 spec yet.

## Behavior

1. Create a flowplayer instance like you normally would (make sure you use the playlist feature).
2. Invoke the attach method to start the vast loading process.
3. The player will will until the vast load has completed (or failed) and rewrite the playlist.
4. The player will be locked until the ad has been viewed then removed from the playlist.

## Usage

This plugin requires that you use the flowplayer playlist functionality.

```
var vast = require('flowplayer-vast');

var container = document.getElementById('div');

var player = flowplayer(container, {
    playlist: []
});

vast.attach(container, player, 'http://serer.com/vast.xml');
```

## Changelog

* 1.0.2: Fixed for vpaid js ads
* 1.0.1: Moved to browserify
* 1.0.0: Initial release