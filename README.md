# flowplayer-vast
VAST 2.0 support within Flowplayer 6 HTML

**Note**: This project is a work in progress and may not fulfill all of the VAST 2.0 spec yet.

## Behavior

1. Create a flowplayer instance like you normally would (make sure you use the playlist feature).
2. Invoke the attach method to start the vast loading process.
3. The player will will until the vast load has completed (or failed) and rewrite the playlist.
 * Only the first video returned in the VAST response is used.
 * If the creative is of type "application/javascript" the playlist is left as is and the event vpaid_js is invoked on the player object.
4. The player will be locked until the ad has been viewed then removed from the playlist.

## Simple Usage

This plugin requires that you use the flowplayer playlist functionality.

```
var vast = require('flowplayer-vast');

var container = document.getElementById('div');

var player = flowplayer(container, {
    playlist: [],
    wmode: 'transparent' // support onclick event for IE for ad clicks
});

vast.init(container, player, 'http://serer.com/vast.xml');
```

## Advanced Usage

```
var vast = require('flowplayer-vast');

var container = document.getElementById('div');
var playlist = [];

vast.loadPreroll(container, 'http://serer.com/vast.xml', function(preroll){
    if (preroll && preroll.video) {
        playlist.unshift(preroll.video);
    }

    var player = flowplayer(container, {
        playlist: playlist,
        wmode: 'transparent' // support onclick event for IE for ad clicks
    });

    if (preroll) {
        vast.attachEvents(container, player);

        // if you have the flowplayer-vpaid plugin setup
        if (preroll.swf) {
            return player.trigger('vpaid_swf', [preroll.swf]);
        }

        if (preroll.js) {
            return player.trigger('vpaid_js', [preroll.js]);
        }
    }
});
```

## VPAID (JS)

To support vpaid responses for javascript, you can either use the [flowplayer-vpaid](https://github.com/mantisadnetwork/flowplayer-vpaid) project or implement your own like so:

```
player.on('vpaid_js', function (e, config) {
    // configure vpaid environment
});
```

## Changelog

* 1.1.0: More granular API, edge case fixes across device
* 1.0.4: Only mark complete if it has not been skipped
* 1.0.3: Bug fix
* 1.0.2: Fixed for vpaid js ads
* 1.0.1: Moved to browserify
* 1.0.0: Initial release
