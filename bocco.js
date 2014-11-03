var fs = require('fs');
var md = fs.readFileSync('/dev/stdin').toString();
var template = fs.readFileSync('template.html').toString();
var marked = require('marked');
var renderer = new marked.Renderer();

var format = function(format) {
  var args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
};

var section, title, toc = [];

renderer.heading = function(text, level) {
  var code = (text.match(/<code>.+<\/code>/g, '') || [''])[0];
  if (code) text = text.replace(/<code>.+<\/code>/g, '');

  var id = text.toLowerCase().trim().replace(/[^\w]+/g, '-');
  if (level === 1) title = text;
  else if (level === 2) section = id;
  else if (level === 3 && section) id = section + '/' + id;
  toc.push(format('<h{0}><a href="#{1}">{2}</a></h{0}>', level, id, level === 3 ? ' - ' + text : text));
  return format('<h{0}><a name="{1}" class="anchor" href="#{1}">{2}</a>{3}<span class="ac">¶</span></h{0}>', level, id, text, code);
};

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

// Synchronous highlighting with highlight.js
// marked.setOptions({
//   highlight: function (code) {
//     return require('highlight.js').highlightAuto(code).value;
//   }
// });

var html = marked(md, { renderer: renderer });
html = format(template, title, toc.join(''), html);
console.log(html);