(function (force) {
	window.rafcaf_loaded = true;

	if (!force) {
		if (undefined === window.requestAnimationFrame) {
			window.requestAnimationFrame =
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame;
		}
		if (undefined === window.cancelAnimationFrame) {
			window.cancelAnimationFrame =
				window.webkitCancelAnimationFrame ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelAnimationFrame;
		}
	}

	if (
		force ||
		(undefined === window.requestAnimationFrame) ||
		(undefined === window.cancelAnimationFrame)
	) {
		var now = (undefined !== Date.now)
			? function () { return Date.now(); }
			: function () { return new Date().getTime(); };

		window.requestAnimationFrame = function requestAnimationFrame(callback) {
			return setTimeout(callback, 16 - (now() % 16));
		};
		window.cancelAnimationFrame = function cancelAnimationFrame(id) {
			clearTimeout(id);
		};
	}
})();

var on = (function () {
	var on;

	if (window.addEventListener) {
		on = function (target, event, listener, useCapture) {
			target["addEventListener"](event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			target["removeEventListener"](event, listener, useCapture);
		};
	}
	else if (window.attachEvent) {
		on = function (target, event, listener, useCapture) {
			target["attachEvent"]("on" + event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			target["detachEvent"]("on" + event, listener, useCapture);
		};
	}
	else {
		on = function () {
			throw new ReferenceError("Browser does not support event handlers.");
		};
		on.remove = function () { on(); };
		on.supported = false;
	}

	return on;
})();

if (!Object.create) {
	function CreatedObject() { }

	Object.create = (function () {
		return function (prototype) {
			CreatedObject.prototype = prototype;
			return new CreatedObject();
		};
	})();
}

if (!Math.constrain) {
	Math.contrain = function (value, min, max) {
		if (value < min) { return min; }
		else if (value > max) { return max; }
		else { return value; }
	};
}

if (!Math.random.gaussian) {
	// http://www.protonfish.com/jslib/boxmuller.shtml
	Math.random.gaussian = function () {
		var x = 0, y = 0, rds, c;

		// Get two random numbers from -1 to 1.
		// If the radius is zero or greater than 1, throw them out and pick two new ones
		// Rejection sampling throws away about 20% of the pairs.
		do {
			x = Math.random() * 2 - 1;
			y = Math.random() * 2 - 1;
			rds = x * x + y * y;
		}
		while (rds == 0 || rds > 1)

		// This magic is the Box-Muller Transform
		c = Math.sqrt(-2 * Math.log(rds) / rds);

		// It always creates a pair of numbers. I'll return them in an array. 
		// This function is quite efficient so don't be afraid to throw one away if you don't need both.
		return x * c;
	};

	//Math.random.gaussian = function () {
	//	var r = ((Math.random() * 2) - 1);
	//	return r * Math.abs(r);
	//};
}

if (!Math.random.perlin) {
	// https://gist.github.com/banksean/304522
	Math.random.perlin = (function () {
		// Ported from Stefan Gustavson's java implementation
		// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
		// Read Stefan's excellent paper for details on how this code works.
		//
		// Sean McCullough banksean@gmail.com

		/**
		* You can pass in a random number generator object if you like.
		* It is assumed to have a random() method.
		*/
		var ClassicalNoise = function (r) { // Classic Perlin noise in 3D, for comparison 
			if (r == undefined) r = Math;
			this.grad3 = [
				[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
			];
			this.p = [];
			for (var i = 0; i < 256; i++) {
				this.p[i] = Math.floor(r.random() * 256);
			}
			// To remove the need for index wrapping, double the permutation table length 
			this.perm = [];
			for (var i = 0; i < 512; i++) {
				this.perm[i] = this.p[i & 255];
			}
		};

		ClassicalNoise.prototype.dot = function (g, x, y, z) {
			return g[0] * x + g[1] * y + g[2] * z;
		};

		ClassicalNoise.prototype.mix = function (a, b, t) {
			return (1.0 - t) * a + t * b;
		};

		ClassicalNoise.prototype.fade = function (t) {
			return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
		};

		// Classic Perlin noise, 3D version
		ClassicalNoise.prototype.noise = function (x, y, z) {
			// Find unit grid cell containing point 
			var X = Math.floor(x);
			var Y = Math.floor(y);
			var Z = Math.floor(z);

			// Get relative xyz coordinates of point within that cell 
			x = x - X;
			y = y - Y;
			z = z - Z;

			// Wrap the integer cells at 255 (smaller integer period can be introduced here) 
			X = X & 255;
			Y = Y & 255;
			Z = Z & 255;

			// Calculate a set of eight hashed gradient indices 
			var gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
			var gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
			var gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
			var gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
			var gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
			var gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
			var gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
			var gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

			// The gradients of each corner are now: 
			// g000 = grad3[gi000]; 
			// g001 = grad3[gi001]; 
			// g010 = grad3[gi010]; 
			// g011 = grad3[gi011]; 
			// g100 = grad3[gi100]; 
			// g101 = grad3[gi101]; 
			// g110 = grad3[gi110]; 
			// g111 = grad3[gi111]; 
			// Calculate noise contributions from each of the eight corners 
			var n000 = this.dot(this.grad3[gi000], x, y, z);
			var n100 = this.dot(this.grad3[gi100], x - 1, y, z);
			var n010 = this.dot(this.grad3[gi010], x, y - 1, z);
			var n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
			var n001 = this.dot(this.grad3[gi001], x, y, z - 1);
			var n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
			var n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
			var n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
			// Compute the fade curve value for each of x, y, z 
			var u = this.fade(x);
			var v = this.fade(y);
			var w = this.fade(z);
			// Interpolate along x the contributions from each of the corners 
			var nx00 = this.mix(n000, n100, u);
			var nx01 = this.mix(n001, n101, u);
			var nx10 = this.mix(n010, n110, u);
			var nx11 = this.mix(n011, n111, u);
			// Interpolate the four results along y 
			var nxy0 = this.mix(nx00, nx10, v);
			var nxy1 = this.mix(nx01, nx11, v);
			// Interpolate the two last results along z 
			var nxyz = this.mix(nxy0, nxy1, w);

			return nxyz;
		};

		var noise = new ClassicalNoise();
		return function (x, y, z) {
			return noise.noise(x || 0, y || 0, z || 0);
		};
	})();
}

if (!window.Vector) {
	window.Vector = (function () {
		function Vector(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		var proto = Vector.prototype;

		proto["+"] = proto.add = function (vector) {
			if ((this.x != null) && (vector.x != null)) { this.x += vector.x; }
			if ((this.y != null) && (vector.y != null)) { this.y += vector.y; }
			if ((this.z != null) && (vector.z != null)) { this.z += vector.z; }

			return this;
		};
		Vector["+"] = Vector.add = function (a, b) {
			return new Vector().copy(a).add(b);
		};

		proto["-"] = proto.subtract = proto.sub = function (vector) {
			if ((this.x != null) && (vector.x != null)) { this.x -= vector.x; }
			if ((this.y != null) && (vector.y != null)) { this.y -= vector.y; }
			if ((this.z != null) && (vector.z != null)) { this.z -= vector.z; }

			return this;
		};
		Vector["-"] = Vector.subtract = Vector.sub = function (a, b) {
			return new Vector().copy(a).sub(b);
		};

		proto["*"] = proto.multiply = proto.mult = proto.mul = function (scalar) {
			if (this.x != null) { this.x *= scalar; }
			if (this.y != null) { this.y *= scalar; }
			if (this.z != null) { this.z *= scalar; }

			return this;
		};
		Vector["*"] = Vector.multiply = Vector.mult = Vector.mul = function (vector, scalar) {
			return new Vector().copy(vector).mul(scalar);
		};

		proto["/"] = proto.divide = proto.div = function (scalar) {
			return this.mul(1 / scalar);
		};
		Vector["/"] = Vector.divide = Vector.div = function (vector, scalar) {
			return this.mul(vector, scalar);
		}

		proto.mag = proto.magnitude = function () {
			if (this.x == null) { return undefined; }

			return Math.sqrt(
				(this.x * this.x) +
				((this.y != null) ? (this.y * this.y) : 0) +
				((this.z != null) ? (this.z * this.z) : 0)
			);
		};
		proto.magSq = proto.magnitudeSquared = function () {
			var mag = this.mag();
			return mag * mag;
		};
		proto.norm = proto.normalize = function () {
			var mag = this.mag();
			if (this.x != null) { this.x /= mag; }
			if (this.y != null) { this.y /= mag; }
			if (this.z != null) { this.z /= mag; }

			return this;
		};
		proto.setMag = function (scalar) {
			return this.normalize().multiply(scalar);
		};

		proto.copy = function (from) {
			this.x = from.x;
			this.y = from.y;
			this.z = from.z;

			return this;
		};
		proto.clone = function () {
			return new Vector().copy(this);
		};

		proto.limit = function (magnitude) {
			var mag = this.mag();
			if (mag > magnitude) {
				this.setMag(magnitude);
			}

			return this;
		};

		Vector.random = {};
		Vector.random._2d = Vector.random["2d"] =
			Vector.random._2D = Vector.random["2D"] = function () {
				return new Vector((Math.random() * 2) - 1, (Math.random() * 2) - 1).normalize();
			};

		Vector.empty = new Vector();

		return Vector;
	})();
}