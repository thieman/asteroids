function FPSCounter() {
	TextSprite.apply(this, arguments);
	this.frames = [];
};

FPSCounter.prototype = Object.create(TextSprite.prototype);

FPSCounter.prototype.handleEvent = function(event, fps) {
	switch(event) {
	case 'nextFrame':
		var currentTime = new Date().getTime();
		this.frames = this.frames.filter(function(x) {
			return (x > (currentTime - 1000));
		});
		this.frames.push(currentTime);
		this.text = "FPS: " + this.frames.length;
		break;
	}
};

FPSCounter.prototype.render = function(canvas) {
	$(canvas).drawText({
		text: this.text,
		align: 'right',
		respectAlign: true,
		x: this.x,
		y: this.y,
		fillStyle: this.fillStyle
	});
};

function FrameCounter() {
	TextSprite.apply(this, arguments);
	this.frameNumber = 0;
	this.text = "Frame: " + this.frameNumber;
};

FrameCounter.prototype = Object.create(TextSprite.prototype);

FrameCounter.prototype.handleEvent = function(event, fps) {
	switch(event) {
	case 'nextFrame':
		this.frameNumber += 1;
		this.text = "Frame: " + this.frameNumber;
	}
};

FrameCounter.prototype.render = function(canvas) {
	$(canvas).drawText({
		text: this.text,
		align: 'right',
		respectAlign: true,
		x: this.x,
		y: this.y,
		fillStyle: this.fillStyle
	});
};

function Ship(strokeStyle, strokeWidth, closed, points, maxX, maxY) {
	Line.apply(this, arguments);

	this.active = true;

	this.rotation = 270; // direction ship is pointing in degrees
	this.vector = 0; // direction of ship's movement in degrees
	this.currentSpeed = 0; // current speed in pixels per second
	this.topSpeed = 500; // top speed in pixels per second
	this.bulletSpeed = 600; // bullet speed in pixels per second
	this.acceleration = 2.0; // seconds to reach max speed, linear accel
	this.rotateSpeed = 2; // total seconds to do a 360

	// hyperspace stuff
	this.maxX = maxX;
	this.maxY = maxY;
	this.hyperspaceDelaySeconds = 0.6; // how long it takes to rematerialize
	this.hyperspaceRechargeSeconds = 2.0; // minimum seconds between using hyperspace
	this.hyperspaceDelayFrames = 0;
	this.hyperspaceRechargeFrames = 0;

	this.exhaust = new Line(this.strokeStyle, this.strokeWidth * 0.75, false, [[0, 0]]);
}

Ship.prototype = Object.create(Line.prototype);

Ship.prototype.allowRender = function() {
	return this.active ? true : false;
};

Ship.prototype.renderChildren = function(canvas) {

	if (this.exhaust.active === true) {

    	this.exhaust.points = [
			midpoint(this.points[0][0], this.points[0][1],
    				 this.points[3][0], this.points[3][1]),
    		[this.points[3][0] + 15 * Math.cos((this.rotation - 180) * Math.PI / 180.0),
    		 this.points[3][1] + 15 * Math.sin((this.rotation - 180) * Math.PI / 180.0)],
    		midpoint(this.points[3][0], this.points[3][1],
    				 this.points[2][0], this.points[2][1])
		];

    	this.exhaust.mapPoints();
		this.exhaust.active = false;
    	this.exhaust.render(canvas);
	}

};

Ship.prototype.handleEvent = function(event, fps) {

	if (this.active === false && event !== 'nextFrame') {
		return;
	}

	switch(event) {

	case 'nextFrame':

		for (var i = 0; i < this.points.length; i++) {
			this.points[i][0] += (this.currentSpeed / fps) *
					Math.cos(this.vector * Math.PI / 180.0);
			this.points[i][1] += (this.currentSpeed / fps) *
				Math.sin(this.vector * Math.PI / 180.0);
		}
		this.mapPoints();

		// move point over once wrapping is completed
		if (this.maxY < 0 || this.minY > gameHeight) {
			this.points = _.map(
				this.points,
				function(x) {
					var newY = (x[1] > 0) ? x[1] - gameHeight :
							gameHeight + x[1];
					return [x[0], newY];
				}
			);
		}
		if (this.maxX < 0 || this.minX > gameWidth) {
			this.points = _.map(
				this.points,
				function(x) {
					var newX = (x[0] > 0) ? x[0] - gameWidth :
							gameWidth + x[0];
					return [newX, x[1]];
				}
			);
		}
		this.mapPoints();

		this.hyperspaceDelayFrames -= 1;
		this.hyperspaceRechargeFrames -= 1;

		if (this.hyperspaceDelayFrames === 0) {
			this.active = true;
		}

		break;

	case 'UP_ARROW':

		// vector addition on current vector and thrust vector
		var currentX = this.currentSpeed * Math.cos(this.vector * Math.PI / 180.0);
		var currentY = this.currentSpeed * Math.sin(this.vector * Math.PI / 180.0);
		var thrustX = (this.topSpeed / (this.acceleration * fps)) *
				Math.cos(this.rotation * Math.PI / 180.0);
		var thrustY = (this.topSpeed / (this.acceleration * fps)) *
				Math.sin(this.rotation * Math.PI / 180.0);

		var atan = Math.atan((currentY + thrustY) / (currentX + thrustX));
		atan = (currentX + thrustX < 0) ? atan + Math.PI : atan;
		this.vector = atan * (180.0 / Math.PI);
		this.currentSpeed = Math.sqrt(Math.pow(currentY + thrustY, 2) +
									  Math.pow(currentX + thrustX, 2));
		this.currentSpeed = Math.min(this.currentSpeed, this.topSpeed);

		this.exhaust.active = true;

		break;

	case 'DOWN_ARROW':

		// WE'RE GOING TO PLAID, HYPERSPACE STYLE

		if (this.hyperspaceRechargeFrames > 0) {
			break;
		}

		var xOffset = Math.floor(Math.random() * this.maxX);
		var yOffset = Math.floor(Math.random() * this.maxY);
		this.points = _.map(this.points, function(x) {
			return [x[0] + xOffset, x[1] + yOffset];
		});
		this.currentSpeed = 0;
		this.hyperspaceDelayFrames = this.hyperspaceDelaySeconds * fps;
		this.hyperspaceRechargeFrames = this.hyperspaceRechargeSeconds * fps;

		this.active = false;

		break;

	case 'LEFT_ARROW':

		var rotateDegrees = -360.0 / (fps * this.rotateSpeed);
		var angle = rotateDegrees * Math.PI / 180.0;
		this.rotation += rotateDegrees;

		var center = [this.points[3][0], this.points[3][1]];

		for (var i = 0; i < this.points.length; i++) {
			var origX = this.points[i][0] - center[0];
			var origY = this.points[i][1] - center[1];
			this.points[i][0] = origX * Math.cos(angle) - origY * Math.sin(angle);
			this.points[i][1] = origX * Math.sin(angle) + origY * Math.cos(angle);
			this.points[i][0] += center[0];
			this.points[i][1] += center[1];
		}

		this.mapPoints();
		break;

	case 'RIGHT_ARROW':

		var rotateDegrees = 360.0 / (fps * this.rotateSpeed);
		var angle = rotateDegrees * Math.PI / 180.0;
		this.rotation += rotateDegrees;

		var center = [this.points[3][0], this.points[3][1]];

		for (var i = 0; i < this.points.length; i++) {
			var origX = this.points[i][0] - center[0];
			var origY = this.points[i][1] - center[1];
			this.points[i][0] = origX * Math.cos(angle) - origY * Math.sin(angle);
			this.points[i][1] = origX * Math.sin(angle) + origY * Math.cos(angle);
			this.points[i][0] += center[0];
			this.points[i][1] += center[1];
		}

		this.mapPoints();
		break;

	case 'SPACEBAR':

		// fire a goddamn space bullet into goddamn space
		for (var i = 0; i < bulletPool.length; i++) {
			var bullet = bulletPool[i];
			if (bullet.active === false) {
				bullet.activate(
					this.points[1][0] + (this.currentSpeed / fps) *
						Math.cos(this.vector * Math.PI / 180.0),
					this.points[1][1] + (this.currentSpeed / fps) *
						Math.sin(this.vector * Math.PI / 180.0),
					this.rotation,
					this.bulletSpeed + this.currentSpeed,
					fps
				);
				sprites.push(bullet);
				break;
			}
		}
		break;

	}
};

function Bullet(x, y, r, fillStyle, strokeStyle, strokeWidth, lifeInSeconds) {
	Arc.apply(this, arguments);
	this.lifeInSeconds = lifeInSeconds;
	this.active = false;
}

Bullet.prototype = Object.create(Arc.prototype);

Bullet.prototype.activate = function(x, y, vector, speed, fps) {
	this.active = true;
	this.x = x;
	this.y = y;
	this.vector = vector;
	this.speed = speed;
	this.remainingFrames = fps * this.lifeInSeconds;
};

Bullet.prototype.destruct = function() {
	sprites = _.without(sprites, this);
	this.active = false;
};

Bullet.prototype.handleEvent = function(event, fps) {
	switch(event) {
	case 'nextFrame':

		if (this.remainingFrames === 0) {
			this.destruct();
			break;
		}

		if (this.active === false) {
			break;
		}

		this.x += (this.speed / fps) * Math.cos(this.vector * Math.PI / 180.0);
		this.y += (this.speed / fps) * Math.sin(this.vector * Math.PI / 180.0);
		this.mapPoints();

		// move point over once wrapping is completed
		if (this.maxY < 0 || this.minY > gameHeight) {
			this.y = (this.y > 0) ? this.y - gameHeight : gameHeight + this.y;
		}
		if (this.maxX < 0 || this.minX > gameWidth) {
			this.x = (this.x > 0) ? this.x - gameWidth : gameWidth + this.x;
		}

		this.mapPoints();
		this.remainingFrames -= 1;
		break;
	}
};

function midpoint(x1, y1, x2, y2) {
	return [(x1 + x2) / 2, (y1 + y2) / 2];
};
