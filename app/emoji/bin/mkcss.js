
var emojiData = require('./emoji_pretty.json');

var fs = require('fs');
var util = require('util');

var cssSpecs = [{ prefix: '', size: 20 }, { prefix: '#emoji-list ', size: 45 }];

cssSpecs.forEach(function (spec) {
  var cssFile = __dirname + '/../emoji-' + spec.size + 'px.css';
  fs.open(cssFile , 'w', function (err, file) {
    writeIntro(file, spec);
    writeEmoji(file, spec);
  });
});

function writeIntro(file, spec) {
  var prefix = spec.prefix;
  var size = spec.size;
  var intro = util.format(
    prefix +
    '.emoji { background: url(./sheet_%d.png) top left no-repeat; ' +
    'width: %dpx; height: %dpx; display: inline-block; vertical-align: top; }\n',
    size, size, size
  );
  write(file, intro);
}

function writeEmoji(file, spec) {
  var prefix = spec.prefix;
  var size = spec.size;
  emojiData.forEach(function (emoji) {
    var code =
      emoji.unified.replace(/^0+([0-9a-f]{1,3})-/g, '$1').toLowerCase();
    var cssSelector = '.emoji' + code;
    var rules = util.format(
      'background-position: %dpx %dpx;',
      -emoji.sheet_x * size,
      -emoji.sheet_y * size
    );
    write(file, prefix + cssSelector + ' { ' + rules + ' }\n');
  });
}

function write(file, data) {
  var buffer = new Buffer(data, 'utf-8');
  fs.writeSync(file, buffer, 0, buffer.length, null);
}
