var test = require('tape');
var fs = require('fs');

var Markend = require('../src/markend.js');

test('charmap', function(t) {
  t.same(Markend.charmap(' \t\n'), {9: 1, 10: 1, 32: 1});
  t.end();
});

test('parse', function(t) {
  var tcs = [
    'empty',
    '20',
    '200a',
    'anon',
    'anon-two',
    'anon-ws',
    'named',
    'attr',
    'suffix',
    'escaping',
  ];
  tcs.map(function(tc) {
    var input = fs.readFileSync('test/data/' + tc + '.mend', 'utf-8');
    var output = fs.readFileSync('test/data/' + tc + '.json', 'utf-8');
    var ast = new Markend().parse(input);
    var expected = JSON.parse(output);
    t.same(ast, expected, 'test case: ' + tc);
  });
  t.end();
});

