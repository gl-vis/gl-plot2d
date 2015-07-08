var fit = require('canvas-fit')
var gaussRandom = require('gauss-random')
var mouseWheel = require('mouse-wheel')
var mouseChange = require('mouse-change')
var createCamera = require('camera-2d')
var createAxes = require('../axes2d')

var canvas = document.createElement('canvas')
document.body.appendChild(canvas)
window.addEventListener('resize', fit(canvas), false)

var gl = canvas.getContext('webgl')

var camera = createCamera()

var lastX = 0
var lastY = 0

mouseWheel(function(dx, dy) {
  if(Math.abs(dy) > Math.abs(dx)) {
    dx = 0
  } else {
    dy = 0
  }
  camera.rotateScale(dx, dy, lastX, lastY)
  return true
})

mouseChange(function(buttons, x, y) {
  if(buttons & 1) {
    var dx = 2.0 * (x - lastX) / canvas.width
    var dy = 2.0 * (lastY - y) / canvas.width
    camera.pan(dx, dy)
  }
  lastX = x
  lastY = y
})

function render() {
  requestAnimationFrame(render)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.enable(gl.DEPTH_TEST)
  gl.clearColor(0.93, 0.95, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

render()
