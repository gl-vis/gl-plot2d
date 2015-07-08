'use strict'

var getText = require('text-cache')

function TextElements() {
}

var proto = TextElements.prototype

proto.update = function(options) {
}

proto.dispose = function() {
}

function createTextElements(gl, options) {
  var text = new TextElements(gl)
  text.update(options)
  return text
}
