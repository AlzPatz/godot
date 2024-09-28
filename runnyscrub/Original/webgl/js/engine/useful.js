//Useful.js

//2d Dimensional Vector. Object style vectors are faster for vectors that are created and destroyed alot
//Typed arrays are much faster, but start up cost is prohibitive unless cache
//Interesting link on this : http://media.tojicode.com/sfjs-vectors/#26
var vec2 = function(x, y) {
	this.x = x;
	this.y = y;	
}

vec2.prototype.addSelf = function(v) {
    this.x += v.x; 
    this.y += v.y;
}

vec2.prototype.add = function(v, out) {
	out.x += this.x + v.x;
	out.y += this.y + v.y;
}

vec2.prototype.subtractSelf = function(v) {
    this.x -= v.x; 
    this.y -= v.y;
}

vec2.prototype.subtract = function(v, out) {
	out.x += this.x - v.x;
	out.y += this.y - v.y;
}

vec2.prototype.scaleSelf = function(v) {
    this.x *= v; 
    this.y *= v;
}

vec2.prototype.scale = function(s, out) {
    out.x = this.x * s; 
    out.y = this.y * s;
}

vec2.prototype.rotateSelf = function(r) {
	var x = (this.x * Math.cos(r)) - (this.y * Math.sin(r));
	this.y = (this.x * Math.sin(r)) + (this.y * Math.cos(r));
	this.x = x;
}

vec2.prototype.rotate = function(r, out) {
	out.x = (this.x * Math.cos(r)) - (this.y * Math.sin(r));
	out.y = (this.x * Math.sin(r)) + (this.y * Math.cos(r));
}

vec2.prototype.length = function() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
}

vec2.prototype.normalize = function() {
    var iLen = 1 / this.length();
    this.x *= iLen; this.y *= iLen;
}

//4d Dimensional Colour. Object stgle vectors are faster for vectors that are created and destroged alot
var col4 = function(r, g, b, a) {
	this.r = r;
	this.g = g;	
	this.b = b;
	this.a = a;
}

col4.prototype.addSelf = function(v) {
    this.r += v.r; 
    this.g += v.g;
    this.b += v.b; 
    this.a += v.a;
}

col4.prototype.add = function(v, out) {
	out.r += this.r + v.r;
	out.g += this.g + v.g;
	out.b += this.b + v.b;
	out.a += this.a + v.a;
}

col4.prototype.subtractSelf = function(v) {
    this.r -= v.r; 
    this.g -= v.g;
    this.b -= v.b; 
    this.a -= v.a;
}

col4.prototype.subtract = function(v, out) {
	out.r += this.r - v.r;
	out.g += this.g - v.g;
	out.b += this.b - v.b;
	out.a += this.a - v.a;
}

col4.prototype.scaleSelf = function(v) {
    this.r *= v; 
    this.g *= v;
    this.b *= v; 
    this.a *= v;
}

col4.prototype.scale = function(s, out) {
    out.r = this.r * s; 
    out.g = this.g * s;
    out.b = this.b * s; 
    out.a = this.a * s;
}


