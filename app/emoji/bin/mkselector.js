
'use stricts'

var categories = require('./emoji-categories.json');

var fs = require('fs');
var util = require('util');

var templateFile = __dirname + '/../emoji-selector.hbs';
fs.open(templateFile, 'w', function (err, file) {
  writeIntro(file);
  writeCategories(file);
  writeOutro(file);
});

function writeIntro(file) {
  var intro = '<section id="emoji-list" tabindex="0" class="hidden">\n';
  write(file, intro);
}

function writeCategories(file) {
  writeEmojiLists(file);
  writeCategorySelector(file);
}

function writeEmojiLists(file) {
  categories.forEach(function (category, index) {
    var name = category.category;
    var emoji = category.emoji;

    var ulTemplate = '  <ul class="content emoji-category category-%s">\n';
    write(file, util.format(ulTemplate, name));
    emoji.forEach(function (code) {
      var liTemplate =
        '    <li>\n' +
        '      <span><i class="emoji emoji%s" data-code="&#x%s"></i></span>\n' +
        '    </li>\n';
      var li = util.format(liTemplate, code, code);
      write(file, li);
    })
    write(file, '  </ul>\n');
  });
}

function writeCategorySelector(file) {
  write(file, '  <div role="toolbar">\n');
  write(file, '    <ul class="categories">\n');
  categories.forEach(function (category) {
    var name = category.category;
    var liTemplate = '      <li>' +
                     '<button class="icon icon-%s" data-category="%s">' +
                     '</button></li>\n';
    write(file, util.format(liTemplate, name, name));
  });
  write(file, '    </ul>\n');
  write(file, '  </div>\n');
}

function writeOutro(file) {
  write(file, '</section>');
}

function write(file, data) {
  var buffer = new Buffer(data, 'utf-8');
  fs.writeSync(file, buffer, 0, buffer.length, null);
}
