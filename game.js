var animateAsteroids = true;

var GAME_FPS = 60;
var frameNumber = 0;
var debug = false;
var lastRender = 0;
var events = [];
var sprites = [];
var bulletPool = [];
var maximumBullets = 6;
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

var pushKeys = ['ENTER', 'SPACEBAR', 'DOWN_ARROW'];

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

	playBackgroundAudio();

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

	// deactivate keys that have to be manually pushed each time
	activeKeys = _.reject(activeKeys, function(x) {
		return _.contains(pushKeys, keysMap[x]);
	});

	checkCollisions(sprites, events, 'bullet', 'asteroid');
	checkCollisions(sprites, events, 'asteroid', 'ship');

	for (var i = 0; i < events.length; i++) {
		var event = events[i];
		// handle each collision event
	}

	events = [];

	$(gameWindow).clearCanvas();

	for (var i = 0; i < sprites.length; i++) {
		sprites[i].render(gameWindow);
	}

	frameNumber += 1;
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

	if (debug) {
		sprites.push(new FPSCounter(gameWidth, 12, 0, '#FFF'));
		sprites.push(new FrameCounter(gameWidth, 30, 0, '#FFF'));
	}

	sprites.push(new Ship('#FFF', 2, true,
						  [[midWidth - 7, midHeight + 12],
						   [midWidth, midHeight - 8],
						   [midWidth + 7, midHeight + 12],
						   [midWidth, midHeight + 8]],
						 gameWidth, gameHeight));

	for (var i = 0; i < maximumBullets; i++) {
		bulletPool.push(new Bullet(0, 0, 10, '#FFF', '#FFF', 0, 1));
	}

	spawnAsteroids(7);

}

function spawnAsteroids(toSpawn) {

	// spawns the specified number of large asteroids
	for (var i = 0; i < toSpawn; i++) {
		var form = largeForms[Math.floor(Math.random() *
										 largeForms.length)];
		var edge = Math.floor(Math.random() * 4);

		switch(edge) {
		case 0:
			var xOffset = Math.floor(Math.random() * gameWidth);
			var yOffset = Math.floor(Math.random() * 200);
			break;
		case 1:
			var xOffset = Math.floor(Math.random() * 200);
			var yOffset = Math.floor(Math.random() * gameHeight);
			break;
		case 2:
			var xOffset = Math.floor(Math.random() * gameWidth);
			var yOffset = gameHeight - Math.floor(Math.random() * 200);
			break;
		case 3:
			var xOffset = gameWidth - Math.floor(Math.random() * 200);
			var yOffset = Math.floor(Math.random() * gameHeight);
			break;
		}

		var newForm = _.map(form, function(x) {return [x[0] + xOffset,
													   x[1] + yOffset]; });

		if (animateAsteroids) {
			sprites.push(new Asteroid('#FFF', 1.5, true,
									  newForm, 'large',
									  Math.random() * 360,
									  Math.random() * 100,
									  Math.random() * 360,
									  Math.random() * 30 + 10));
		} else {
			sprites.push(new Asteroid('#FFF', 1.5, true,
									  newForm, 'large',
									  1, 1, 1, 10000));
		}

	}
}

function playBackgroundAudio() {
	return;
	if (frameNumber % (GAME_FPS * 2) === 0) {
		var sfx = new Audio('tonelo.wav');
		sfx.play();
	}
	else if (frameNumber % GAME_FPS === 0) {
		var sfx = new Audio('tonehi.wav');
		sfx.play();
	}
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
	console.log(keycode);
	if (!(_.contains(activeKeys, keycode))) {
		if (!_.contains(activeKeys, -1 * keycode)) {
			if (_.contains(pushKeys, keysMap[keycode])) {
				activeKeys.push(-1 * keycode);
			}
			activeKeys.push(keycode);
		}
	}
}

function onKeyUp(keycode) {
	if (_.contains(activeKeys, keycode) || _.contains(activeKeys, -1 * keycode)) {
		activeKeys = _.filter(activeKeys, function(x) { return (Math.abs(x) !== keycode); });
	}
}
