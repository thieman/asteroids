function Sprite(x, y) {
	this.x = x;
	this.y = y;
}
Sprite.prototype.render = function(canvas) {};

function Background(x, y, w, h) {
	Sprite.apply(this, arguments);
	this.width = w;
	this.height = h;
}
Background.prototype = Object.create(Sprite.prototype);

Background.prototype.render = function(canvas) {
	$(canvas).drawRect({
		fillStyle: '#000',
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		fromCenter: false
	});
};

function TextSprite(x, y, text, fillStyle) {
	Sprite.apply(this, arguments);
	this.text = text;
	this.fillStyle = fillStyle;
}
TextSprite.prototype = Object.create(Sprite.prototype);

TextSprite.prototype.render = function(canvas) {
	$(canvas).drawText({
		text: this.text,
		x: this.x,
		y: this.y,
		fillStyle: this.fillStyle
	});
};

function Arc(x, y, r, fillStyle, strokeStyle, strokeWidth) {
	Sprite.apply(this, arguments);
	this.r = r;
	this.fillStyle = fillStyle;
	this.strokeStyle = strokeStyle;
	this.strokeWidth = strokeWidth;
	this.mapPoints();
}
Arc.prototype = Object.create(Sprite.prototype);

Arc.prototype.mapPoints = function() {
	this.minX = this.x - this.r;
	this.maxX = this.x + this.r;
	this.minY = this.y - this.r;
	this.maxY = this.y + this.r;
};

Arc.prototype.moveAlongVector = function(vector, speed, fps) {
	this.x += (speed / fps) * Math.cos(vector * Math.PI / 180.0);
	this.y += (speed / fps) * Math.sin(vector * Math.PI / 180.0);
	this.mapPoints();
};

Arc.prototype.render = function(canvas) {
	$(canvas).drawEllipse({
		x: this.x,
		y: this.y,
		width: this.r / 2,
		height: this.r / 2,
		fillStyle: this.fillStyle,
		strokeStyle: this.strokeStyle,
		strokeWidth: this.strokeWidth
	});
};

Arc.prototype.handleEvent = function(event, fps) {
	switch(event) {
	case 'nextFrame':

		// move point over once wrapping is completed
		if (this.maxY < 0 || this.minY > gameHeight) {
			this.y = (this.y > 0) ? this.y - gameHeight : gameHeight + this.y;
		}
		if (this.maxX < 0 || this.minX > gameWidth) {
			this.x = (this.x > 0) ? this.x - gameWidth : gameWidth + this.x;
		}

		break;
	}
};

function Line(strokeStyle, strokeWidth, closed, points) {
	this.strokeStyle = strokeStyle;
	this.strokeWidth = strokeWidth;
	this.closed = closed;
	this.points = points;
	this.mapPoints();
}

Line.prototype.mapPoints = function() {

 	for (var p = 0; p < this.points.length; p++) {
		this['x' + (p + 1)] = this.points[p][0];
		this['y' + (p + 1)] = this.points[p][1];
	}

	this.minX = Math.min.apply(Math, _.map(this.points, function(x) { return x[0]; }));
	this.maxX = Math.max.apply(Math, _.map(this.points, function(x) { return x[0]; }));
	this.minY = Math.min.apply(Math, _.map(this.points, function(x) { return x[1]; }));
	this.maxY = Math.max.apply(Math, _.map(this.points, function(x) { return x[1]; }));

	this.height = this.maxY - this.minY;
	this.width = this.maxX - this.minX;

};

Line.prototype.handleEvent = function(event, fps) {
	switch(event) {
	case 'nextFrame':

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
		break;
	}
}

Line.prototype.moveAlongVector = function(vector, speed, fps) {
	for (var i = 0; i < this.points.length; i++) {
		this.points[i][0] += (speed / fps) *
			Math.cos(vector * Math.PI / 180.0);
		this.points[i][1] += (speed / fps) *
			Math.sin(vector * Math.PI / 180.0);
	}
	this.mapPoints();
};

Line.prototype.wrapAround = function() {

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

};

Line.prototype.rotate = function(degrees, center) {

	var angle = degrees * Math.PI / 180.0;
	this.rotation += degrees;

	for (var i = 0; i < this.points.length; i++) {
		var origX = this.points[i][0] - center[0];
		var origY = this.points[i][1] - center[1];
		this.points[i][0] = origX * Math.cos(angle) - origY * Math.sin(angle);
		this.points[i][1] = origX * Math.sin(angle) + origY * Math.cos(angle);
		this.points[i][0] += center[0];
		this.points[i][1] += center[1];
	}

	this.mapPoints();

};

Line.prototype.wrappedPoints = function() {

	// return an array of points to be rendered when object
	// needs to wrap around one of the game edges
	var wrapped = [];

	// handle wrapping along x and y of window
	if (this.minX < 0) {
		wrapped.push(_.map(this.points, function(x) {
			return [gameWidth + x[0], x[1]];
		}));
	}

	if (this.maxX > gameWidth) {
		wrapped.push(_.map(this.points,function(x) {
			return [x[0] - gameWidth, x[1]];
		}));
	}

	if (this.minY < 0) {
		wrapped.push(_.map(this.points,function(x) {
			return [x[0], gameHeight + x[1]];
		}));
	}

	if (this.maxY > gameHeight) {
		wrapped.push(_.map(this.points,function(x) {
			return [x[0], x[1] - gameHeight];
		}));
	}

	return wrapped;

};

Line.prototype.render = function(canvas) {

	if (typeof this.allowRender !== 'undefined') {
		if (!this.allowRender()) {
			return;
		}
	}

	$(canvas).drawLine(this);

	_.each(this.wrappedPoints(), function(points) {
		var wrapped = new Line(
			this.strokeStyle,
			this.strokeWidth,
			this.closed,
			points
		);
		$(canvas).drawLine(wrapped);
	}, this);

	if (typeof this.renderChildren !== 'undefined') {
		this.renderChildren(canvas);
	}
};
