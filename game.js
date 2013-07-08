var GAME_FPS = 30;
var frameNumber = 0;
var lastRender = 0;
var events = [];
var sprites = [];
var gameWindow = null;
var activeKeys = [];

var gameWidth = 0;
var gameHeight = 0;
var midWidth = 0;
var midHeight = 0;

var keysMap = {
	37: 'LEFT_ARROW',
	38: 'UP_ARROW',
	39: 'RIGHT_ARROW',
	40: 'DOWN_ARROW',
	13: 'ENTER',
	32: 'SPACEBAR'
};

$(document).ready(function() {

	$(document).bind('keydown', function(e) {
		onKeyDown(e.which);
	});
	$(document).bind('keyup', function(e) {
		onKeyUp(e.which);
	});

	initGame();
	mainLoop();

});

function mainLoop() {

	lastRender = new Date().getTime();

	// push user input and animate events to every sprite
	for (var i = 0; i < sprites.length; i++) {
		if (typeof sprites[i].handleEvent === 'function') {
			for (var j = 0; j < activeKeys.length; j++) {
				if (activeKeys[j] in keysMap) {
					sprites[i].handleEvent(keysMap[activeKeys[j]], GAME_FPS);
				}
			}
			sprites[i].handleEvent('nextFrame', GAME_FPS);
		}
	}

	// collision detection here which adds new events

	for (var i = 0; i < events.length; i++) {
		var event = events[i];
		// do stuff with each event
	}

	events = [];

	$(gameWindow).clearCanvas();
	frameNumber += 1;

	for (var i = 0; i < sprites.length; i++) {
		sprites[i].render(gameWindow);
	}

	fpsClock(GAME_FPS, mainLoop);

}

function initGame() {

	var canvas = document.getElementById('game');
	gameWindow = $('#game');

	gameWidth = window.innerWidth;
	gameHeight = window.innerHeight;
	midWidth = gameWidth / 2;
	midHeight = gameHeight / 2;

	canvas.width = gameWidth;
	canvas.height = gameHeight;

	sprites.push(new Background(0, 0, gameWidth, gameHeight));
	sprites.push(new FPSCounter(gameWidth, 12, 0, '#FFF'));
	sprites.push(new FrameCounter(gameWidth, 30, 0, '#FFF'));
	sprites.push(new Ship('#FFF', 2, true,
						  [[midWidth - 7, midHeight + 12],
						   [midWidth, midHeight - 8],
						   [midWidth + 7, midHeight + 12],
						   [midWidth, midHeight + 8]]));

}

function fpsClock(fps, callback) {
	var currentTime = new Date().getTime();
	if ((currentTime - lastRender) < (1000 / fps)) {
		setTimeout(callback, (1000 / fps) - (currentTime - lastRender));
	} else {
		callback();
	}
}

function onKeyDown(keycode) {
	if (!(_.contains(activeKeys, keycode))) {
		activeKeys.push(keycode);
	}
}

function onKeyUp(keycode) {
	if (_.contains(activeKeys, keycode)) {
		activeKeys = _.filter(activeKeys, function(x) { return (x !== keycode); });
	}
}
