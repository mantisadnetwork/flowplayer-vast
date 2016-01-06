var vast = require("../bower_components/vast-client-js/vast-client");
var videoFormats = ['application/x-mpegurl', 'video/webm', 'video/mp4'];

module.exports = {
	attach: function (container, player, url) {
		if (player.conf.wmode != 'transparent') {
			throw new Error('The player must have wmove = transparent for video clicks to work in IE.');
		}

		if (!player.conf.playlist || !player.conf.playlist.length) {
			throw new Error('The player must have a playlist configured.');
		}

		var onClick = false;
		var hasAds = null;
		var ready = false;
		var ad = null;
		var onReadied = false;
		var forceAd = false;

		var onReady = function () {
			if (hasAds && ready && !onReadied) {
				onReadied = true;

				// setPlaylist only works after ready event fires
				player.setPlaylist([ad, player.video]);
			}
		};

		if (flowplayer.support.inlineVideo) {
			var ui = container.querySelectorAll('.fp-player')[0];

			ui.addEventListener('click', function (e) {
				var isElement = e.target.className == 'fp-ui' || e.target.className == 'fp-engine';

				if (!isElement || !player.video.ad) {
					return;
				}

				ad.tracker.click();
			}, true);
		}

		this.loadVast(container, url, function (results) {
			hasAds = results.length > 0;

			if (results[0].js) {
				return player.trigger('vpaid_js', [results[0].js]);
			}

			// only handle single pre-roll for now
			if (results[0].clip) {
				ad = results[0].clip;
			}

			onReady();
		});

		player.on('resume', function () {
			if (hasAds == undefined) {
				// TODO: trigger loading indicator on player?
				// do not play until vast has loaded
				return player.stop();
			}

			if (hasAds && !forceAd) {
				forceAd = true;

				player.play(0);
			}
		});

		player.on('progress', function (event, player, duration) {
			if (!player.video.ad) {
				return;
			}

			ad.tracker.setProgress(duration);

			var title = container.querySelectorAll('.fp-title')[0];

			if (!onClick) {
				onClick = true;

				title.onclick = function () {
					if (player.video.skip && player.video.time >= player.video.skip) {
						ad.tracker.skip();

						player.play(1);
					}
				};
			}

			if (title) {
				if (player.video.skip) {
					if (player.video.skip && duration >= player.video.skip) {
						title.innerHTML = "Advertisement: <strong>Skip Ad &raquo;</strong>";
					} else {
						title.innerHTML = "Advertisement: Skippable in " + Math.round(player.video.skip - duration) + " seconds...";
					}
				} else {
					title.innerHTML = "Advertisement: Ends in " + Math.round(player.video.duration - duration) + " seconds...";
				}
			}
		});

		player.on('ready', function () {
			ready = true;

			onReady();

			if (player.video.ad) {
				ad.tracker.load();
			}

			// prevent user from altering player state when ad is showing
			player.disable(player.video.ad || false);

			if (forceAd && !player.video.ad) {
				ad.tracker.complete();

				// take ad out of rotation once user has seen it
				player.removePlaylistItem(0);
			}
		});
	},
	loadVast: function (container, url, callback) {
		vast.client.get(url, function (response) {
			var ads = [];

			if (response) {
				response.ads.forEach(function (ad) {
					ad.creatives.some(function (creative) {
						if (creative.type != 'linear') {
							return;
						}

						var clip = {
							tracker: new vast.tracker(ad, creative),
							skip: creative.skipDelay,
							title: 'Advertisement',
							ad: true,
							sources: []
						};

						clip.tracker.on('clickthrough', function (url) {
							window.open(url);
						});

						var typeMap = {};
						var smallest = {};

						creative.mediaFiles.forEach(function (media) {
							if (media.mimeType == 'application/javascript') {
								return ads.push({
									js: {
										src: media.fileURL,
										parameters: creative.adParameters,
										tracker: new vast.tracker(ad, creative)
									}
								});
							}

							if (videoFormats.indexOf(media.mimeType) > -1) {
								var vid = {
									width: media.width,
									height: media.height,
									seconds: creative.duration,
									src: media.fileURL
								};

								if (!smallest[media.mimeType] || smallest[media.mimeType].width > media.width) {
									smallest[media.mimeType] = vid;
								}

								if (container.offsetWidth >= media.width && (!typeMap[media.mimeType] || media.width > typeMap[media.mimeType].width)) {
									typeMap[media.mimeType] = vid;
								}
							}
						});

						videoFormats.forEach(function (format) {
							var vid = typeMap[format] || smallest[format];

							if (vid) {
								clip.sources.push({
									type: format,
									seconds: vid.seconds,
									width: vid.width,
									height: vid.height,
									src: vid.src
								});
							}
						});

						if (clip.sources.length > 0) {
							ads.push({
								clip: clip
							});
						}

						return true;
					});
				});
			}

			callback(ads);
		});
	}
};