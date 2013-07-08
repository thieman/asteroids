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

function Ship() {
	Line.apply(this, arguments);
	this.rotation = 270; // direction ship is pointing in degrees
	this.vector = 0; // direction of ship's movement in degrees
	this.currentSpeed = 0; // current speed in pixels per second
	this.topSpeed = 200; // top speed in pixels per second
	this.acceleration = 0.8; // seconds to reach max speed, linear accel
	this.rotateSpeed = 2; // total seconds to do a 360
}

Ship.prototype = Object.create(Line.prototype);

Ship.prototype.handleEvent = function(event, fps) {
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
			this.points = _.map(this.points,
								function(x) {
									var newY = (x[1] > 0) ? x[1] - gameHeight :
											gameHeight + x[1];
									return [x[0], newY];
								});
		}
		if (this.maxX < 0 || this.minX > gameWidth) {
			this.points = _.map(this.points,
								function(x) {
									var newX = (x[0] > 0) ? x[0] - gameWidth :
											gameWidth + x[0];
									return [newX, x[1]];
								});
		}
		this.mapPoints();

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

		break;

	case 'DOWN_ARROW':
		// full stop for testing
		this.currentSpeed = 0;
		break;

	case 'LEFT_ARROW':

		var rotateDegrees = -360.0 / (fps * this.rotateSpeed);
		var angle = rotateDegrees * Math.PI / 180.0;
		this.rotation += rotateDegrees;

		for (var i = 0; i < this.points.length; i++) {
			var origX = this.points[i][0] - (this.minX + (this.width / 2.0));
			var origY = this.points[i][1] - (this.minY + (this.height / 2.0));
			this.points[i][0] = origX * Math.cos(angle) - origY * Math.sin(angle);
			this.points[i][1] = origX * Math.sin(angle) + origY * Math.cos(angle);
			this.points[i][0] += (this.minX + (this.width / 2.0));
			this.points[i][1] += (this.minY + (this.height / 2.0));
		}

		this.mapPoints();
		break;

	case 'RIGHT_ARROW':

		var rotateDegrees = 360.0 / (fps * this.rotateSpeed);
		var angle = rotateDegrees * Math.PI / 180.0;
		this.rotation += rotateDegrees;

		for (var i = 0; i < this.points.length; i++) {
			var origX = this.points[i][0] - (this.minX + (this.width / 2.0));
			var origY = this.points[i][1] - (this.minY + (this.height / 2.0));
			this.points[i][0] = origX * Math.cos(angle) - origY * Math.sin(angle);
			this.points[i][1] = origX * Math.sin(angle) + origY * Math.cos(angle);
			this.points[i][0] += (this.minX + (this.width / 2.0));
			this.points[i][1] += (this.minY + (this.height / 2.0));
		}

		this.mapPoints();
		break;

	}
}
