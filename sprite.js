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
			this.points = _.map(this.points,
								function(x) {
									return [x[0], Math.abs(gameHeight - x[1])];
								});
		}
		if (this.maxX < 0 || this.minX > gameWidth) {
			this.points = _.map(this.points,
								function(x) {
									return [Math.abs(gameWidth - x[0]), x[1]];
								});
		}

		this.mapPoints();
		break;
	}
}

Line.prototype.render = function(canvas) {
	$(canvas).drawLine(this);
	// handle wrapping along x and y of window
	if (this.minX < 0) {
		var wrapped = new Line(this.strokeStyle,
							   this.strokeWidth,
							   this.closed,
							   _.map(this.points,
									 function(x) {
										 return [gameWidth + x[0], x[1]];
									 })
							  );
		$(canvas).drawLine(wrapped);
	}
	if (this.maxX > gameWidth) {
		var wrapped = new Line(this.strokeStyle,
							   this.strokeWidth,
							   this.closed,
							   _.map(this.points,
									 function(x) {
										 return [x[0] - gameWidth, x[1]];
									 })
							  );
		$(canvas).drawLine(wrapped);
	}
	if (this.minY < 0) {
		var wrapped = new Line(this.strokeStyle,
							   this.strokeWidth,
							   this.closed,
							   _.map(this.points,
									 function(x) {
										 return [x[0], gameHeight + x[1]];
									 })
							  );
		$(canvas).drawLine(wrapped);
	}
	if (this.maxY > gameHeight) {
		var wrapped = new Line(this.strokeStyle,
							   this.strokeWidth,
							   this.closed,
							   _.map(this.points,
									 function(x) {
										 return [x[0], x[1] - gameHeight];
									 })
							  );
		$(canvas).drawLine(wrapped);
	}
};
