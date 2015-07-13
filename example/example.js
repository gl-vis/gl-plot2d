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


function makeTicks(count) {
  var result = []
  for(var i=0; i<count; ++i) {
    result.push({
      x: i,
      text: i + ''
    })
  }
  return result
}

var axes = createAxes(gl, {
  bounds: [-1,-1],
  ticks:  [ makeTicks(10), makeTicks(10) ],
  labels: ['x', 'y']
})

var lastX = 0
var lastY = 0

mouseWheel(function(dx, dy) {
  if(Math.abs(dy) > Math.abs(dx)) {
    dx = 0
  } else {
    dy = 0
  }
  camera.scaleRotate(Math.exp(0.1*dy/canvas.height), 2.0*Math.PI*dx/canvas.width, lastX, lastY)
  return true
})

mouseChange(function(buttons, x, y) {
  if(buttons & 1) {
    camera.translate(x - lastX, lastY - y)
  }
  lastX = x
  lastY = y
})

function render() {
  camera.width  = canvas.width
  camera.height = canvas.height
  requestAnimationFrame(render)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.enable(gl.DEPTH_TEST)
  gl.clearColor(0.93, 0.95, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  axes.draw(camera.getMatrix())
}

render()
