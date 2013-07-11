function checkCollisions(sprites, events, fps, typeA, typeB) {

	var collisionSprites = [];

	for (var i = 0; i < sprites.length; i++) {

		var spriteA = sprites[i];
		if (typeof spriteA.collideType === 'undefined' || spriteA.collideType !== typeA) {
			continue;
		}

		for (var j = 0; j < sprites.length; j++) {

			var spriteB = sprites[j];
			if (j === i || typeof spriteB.collideType === 'undefined' ||
				spriteB.collideType !== typeB) {
				continue;
			}

			var checkA = [spriteA];
			var checkB = [spriteB];

			if (typeof spriteA.wrappedPoints !== 'undefined') {
				_.each(spriteA.wrappedPoints(), function(wrapped) {
					this.push({points: wrapped});
				}, checkA);
			}
			if (typeof spriteB.wrappedPoints !== 'undefined') {
				_.each(spriteB.wrappedPoints(), function(wrapped) {
					this.push({points: wrapped});
				}, checkB);
			}

			if (typeA === 'bullet' && typeB === 'asteroid') {

				for (var k = 0; k < checkA.length; k++) {
					for (var l = 0; l < checkB.length; l++) {
						if (checkArcAgainstLine(checkA[k], checkB[l], fps)) {
							collisionSprites.push(spriteA);
							collisionSprites.push(spriteB);
						}
					}
				}

			} else if (typeA === 'ship' && typeB === 'asteroid') {

				for (var k = 0; k < checkA.length; k++) {
					for (var l = 0; l < checkB.length; l++) {
						if (checkLineAgainstLine(checkA[k], checkB[l])) {
							collisionSprites.push(spriteA);
							collisionSprites.push(spriteB);
						}
					}
				}

			}

		}

	}

	_.each(sprites, function(sprite) {

		var events = this[0];
		var collisionSprites = this[1];

		if (_.contains(collisionSprites, sprite) && !(_.contains(events, sprite))) {
			events.push(sprite);
		}

	}, [events, collisionSprites]);

}

function checkArcAgainstLine(arc, line, fps) {
	// translates the arc into a line that represents its positions
	// over the next frame. arc needs speed and vector, line needs points array

	var arcLine = [];
	arcLine.push([arc.x + -1 * arc.r * Math.cos(arc.vector * Math.PI / 180.0),
				  arc.y + -1 * arc.r * Math.sin(arc.vector * Math.PI / 180.0)]);
	arcLine.push([arc.x + ((arc.speed / fps) + arc.r) * Math.cos(arc.vector * Math.PI / 180.0),
				  arc.y + ((arc.speed / fps) + arc.r) * Math.sin(arc.vector * Math.PI / 180.0)]);

	return checkLineAgainstLine({points: arcLine}, line);
}

function checkLineAgainstLine(line1, line2) {

	// assumes each line has a points array and is closed
	var collisions = [];

	for (var idx1 = 0; idx1 < line1.points.length; idx1++) {
		var idx2 = idx1 === line1.points.length - 1 ? 0 : idx1 + 1;
		for (var idx3 = 0; idx3 < line2.points.length; idx3++) {
			var idx4 = idx3 === line2.points.length - 1 ? 0 : idx3 + 1;
			collisions.push(lineIntersection(line1.points[idx1], line1.points[idx2],
											 line2.points[idx3], line2.points[idx4]));
		}
	}

	return _.some(collisions, function(x) { return x; });
}

function lineIntersection(p1, p2, p3, p4) {

	// returns bool of whether two lines intersect
	// point parameters are [x,y] with line 1 as (p1,p2)

	var m1 = (p2[0] - p1[0]) !== 0 ? (p2[1] - p1[1]) / parseFloat(p2[0] - p1[0]) : NaN;
	var m2 = (p4[0] - p3[0]) !== 0 ? (p4[1] - p3[1]) / parseFloat(p4[0] - p3[0]) : NaN;

	if (m1 === m2 || (isNaN(m1) && isNaN(m2))) {
		return false;
	}

	var px = ( (p1[0] * p2[1] - p1[1] * p2[0]) * (p3[0] - p4[0]) -
			   (p1[0] - p2[0]) * (p3[0] * p4[1] - p3[1] * p4[0]) ) /
			 ( (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]) );

	var py = ( (p1[0] * p2[1] - p1[1] * p2[0]) * (p3[1] - p4[1]) -
			   (p1[1] - p2[1]) * (p3[0] * p4[1] - p3[1] * p4[0]) ) /
			 ( (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]) );

	// see if (px,py) lies within each line figure's bounding boxes
	if (px >= Math.min(p1[0], p2[0]) && px <= Math.max(p1[0], p2[0]) &&
		py >= Math.min(p1[1], p2[1]) && py <= Math.max(p1[1], p2[1]) &&
		px >= Math.min(p3[0], p4[0]) && px <= Math.max(p3[0], p4[0]) &&
		py >= Math.min(p3[1], p4[1]) && py <= Math.max(p3[1], p4[1])) {
		return true;
	}

	return false;

}
