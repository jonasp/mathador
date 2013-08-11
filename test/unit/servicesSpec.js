'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('mathador.services'));

	describe('colorpool', function() {
		it('should hava a default color', inject(function(colorpool) {
			expect(colorpool.default).not.toEqual(null);
		}));

		it('should return color strings for clients', inject(function(colorpool) {
			// drain pool
			for (var i = 0; i < colorpool.available.length; i++) {
				expect(typeof(colorpool.get(i))).toEqual("string");
			}

			// if pool empty default string should be expected
			var ret = colorpool.get("another");
			expect(ret).toEqual(colorpool.default);
			expect(typeof(ret)).toEqual("string");
		}));

		it('should drain the pool from the top', inject(function(colorpool) {
			// everything should be free
			expect(colorpool.free()).toEqual(colorpool.available);

			for (var i = 0; i < colorpool.available.length; i++) {
				// initial color draining should be in order of available colors
				expect(colorpool.get(i)).toEqual(colorpool.available.slice(i,i+1)[0]);
				// the free colors should decrease in the same order
				expect(colorpool.free()).toEqual(colorpool.available.slice(i+1));
			}
		}));

		it('should give different colors to clients', inject(function(colorpool) {
			// drain pool to clients
			var clients = [];
			for (var i = 0; i < colorpool.available.length; i++) {
				clients.push(colorpool.get(i));
			}

			// all clients should have different colors
			for (var i = 0; i < clients.length; i++)  {
				for (var j = 0; j < clients.length; j++) {
					if (i != j) {
						expect(clients[i]).not.toEqual(clients[j]);
					}
				}
			}
		}));

		it('should allow releasing and reusing colors', inject(function(colorpool) {
			// only do this test if colorpool is at least 4
			if (colorpool.available.length > 3) {
				var color1 = colorpool.get("id1");
				var color2 = colorpool.get("id2");

				// expect colors to be in colorpool
				expect(colorpool.available.indexOf(color1)).toBeGreaterThan(-1);
				expect(colorpool.available.indexOf(color2)).toBeGreaterThan(-1);

				colorpool.release("id1");
				var color3 = colorpool.get("id3");

				// use released color
				expect(color3).toEqual(color1);

				// old id should get new color
				var newColor1 = colorpool.get("id1");
				expect(newColor1).not.toEqual(color1);
			}
		}));

		it('should allow repeated getting and (re)releasing', inject(function(colorpool) {
			for (var i = 0; i < 1000; i++) {
				// generate index in pool range
				var rand = Math.floor(Math.random()*colorpool.available.length);
				if (Math.floor(Math.random()*2)) {
					// expect a valid color in the pool range
					expect(colorpool.available.indexOf(colorpool.get(rand))).toBeGreaterThan(-1);
				} else {
					colorpool.release(rand);
				}
			}
		}));

		it('should return default color when pool is empty', inject(function(colorpool) {
			// drain color pool
			for (var i = 0; i < colorpool.available.length; i++) {
				//console.log(i);
				//console.log(colorpool.get(i));
			}
			expect(typeof(colorpool.get("id"))).toEqual("string");
		}));
	});

	describe('broadcast', function() {
	});

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
