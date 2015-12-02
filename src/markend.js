var Markend = function() {};

Markend.charmap = function(charset) {
  return charset.split('').reduce(function(map, ch) {
    return map[ch.charCodeAt(0)] = 1, map;
  }, {});
};

const WS = Markend.charmap(' \t'); // whitespace
const WSNL = Markend.charmap(' \t\n'); // whitespace and new line
const ID = Markend.charmap(' \t\n\\.'); // escaped characters in identifier
const SUFFIX = Markend.charmap(' \t\n\\'); // escaped characters in suffix
const ATTR_KEY = Markend.charmap(' \t\n\\='); // escaped characters in attribute key
const ATTR_VAL = Markend.charmap(' \t\n\\'); // escaped characters in attribute value

const BS = '\\'.charCodeAt(0); // backslash
const NL = '\n'.charCodeAt(0); // new line
const EQ = '='.charCodeAt(0); // equal sign

Markend.prototype.parse = function(src) {
  this._src = src;
  this._eof = src.length;
  this._p = 0;
  this._ast = [];
  this._func = '';
  this._suff = '';
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
  if (this.matchPrefix()) {
    var func = this.matchEscaped(ID);
    var suff = this.matchEscaped(SUFFIX);
    var attr = {};
    for (this.matchCharSeq(WS); this.matchAttr(attr); this.matchCharSeq(WS));
    if (this.matchLineEnd()) {
      this.endChunk();
      this._func = func;
      this._suff = suff;
      this._attr = attr;
      this._head = this._tail = this._p;
      return;
    }
  }

  for (; !this.matchLineEnd(); this._p++);
  this._tail = this._p - !this.eof();
};

Markend.prototype.matchPrefix = function() {
  if (!this._suff) {
    return this.matchCharCode(BS);
  }
  if (this.matchString(this._suff)) {
    var pos = this._p;
    this.matchCharSeq(WSNL);
    if (this.matchCharCode(BS)) {
      return true;
    }
    this._p = pos;
  }
  return false;
};

Markend.prototype.matchAttr = function(attr) {
  var pos = this._p;
  var key = this.matchEscaped(ATTR_KEY);
  if (key) {
    var val = "1";
    if (this.matchCharCode(EQ)) {
      val = this.matchEscaped(ATTR_VAL);
    }
    if (!attr[key]) {
      attr[key] = [];
    }
    attr[key].push(val);
    return true;
  }
  this._p = pos;
  return false;
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

Markend.prototype.matchEscaped = function(blacklist) {
  var str = this._src.substr(this._p, this.matchCharSeq(blacklist, 1));
  if (!this.eof() && this.matchCharCode(BS) && !this.eof()) {
    str += this._src.substr(this._p++, 1) + this.matchEscaped(blacklist);
  }
  return str;
};

Markend.prototype.matchString = function(str) {
  var n = str.length;
  return this._p + n <= this._eof &&
      this._src.substr(this._p, n) === str && !!(this._p += n);
};

Markend.prototype.matchCharCode = function(cc) {
  return this._src.charCodeAt(this._p) === cc ? (this._p++, 1) : 0;
};

Markend.prototype.matchCharSeq = function(cs, not) {
  var pos = this._p;
  while (!this.eof()) {
    var cc = this._src.charCodeAt(this._p);
    if (!cs[cc] ^ !not) {
      this._p++;
    } else {
      break;
    }
  }
  return this._p - pos;
};

module.exports = Markend;
