var Markend = function() {};

Markend.charmap = function(charset) {
  return charset.split('').reduce(function(map, ch) {
    return map[ch.charCodeAt(0)] = 1, map;
  }, {});
};

const WS = Markend.charmap(' \t'); // whitespace

const BS = '\\'.charCodeAt(0); // backslash
const NL = '\n'.charCodeAt(0); // new line

Markend.prototype.parse = function(src) {
  this._src = src;
  this._eof = src.length;
  this._p = 0;
  this._ast = [];
  this._func = '';
  this._attr = {};
  this._head = 0;
  this._tail = -1;
	for (; !this.eof(); this.matchLine());
  this.endChunk();
  return this._ast;
};

Markend.prototype.eof = function() {
  return this._p === this._eof;
};

Markend.prototype.matchLine = function() {
  this.matchCharSeq(WS);
  if (this.matchCharCode(BS)) {
    this.matchCharSeq(WS);
    if (this.matchLineEnd()) {
      this.endChunk();
      this._func = '';
      this._attr = {};
      this._head = this._tail = this._p;
      return;
    }
  }

  for (; !this.matchLineEnd(); this._p++);
  this._tail = this._p - !this.eof();
};

Markend.prototype.endChunk = function() {
  if (this._tail >= 0) {
    this._ast.push({
      f: this._func,
      a: this._attr,
      c: this._src.substring(this._head, this._tail),
    });
  }
};

Markend.prototype.matchLineEnd = function() {
  return this.eof() || (this._src.charCodeAt(this._p) === NL && !!++this._p);
};

Markend.prototype.matchCharCode = function(cc) {
  return this._src.charCodeAt(this._p) === cc ? (this._p++, 1) : 0;
};

Markend.prototype.matchCharSeq = function(cs) {
  var pos = this._p;
  while (!this.eof()) {
    var cc = this._src.charCodeAt(this._p);
    if (cs[cc]) {
      this._p++;
    } else {
      break;
    }
  }
  return this._p - pos;
};

module.exports = Markend;
