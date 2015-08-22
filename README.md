# gl-plot2d

A WebGL based 2D rendering for large plots.

## Example

## Install

With [npm](http://github.com/gl-vis/gl-plot2d),

```
npm i gl-plot2d
```

## API

### Constructor

#### `var plot = require('gl-plot2d')(options)`
Constructs a new `gl-plot2d` object.

* `options` is an object containing parameters for constructing the plot

Options can contain the following parameters,

##### Required properties

| Property | Description |
|----------|-------------|
| `gl`     |  |

##### Coordinate bounds

| Property | Description | Default |
|----------|-------------|---------|
| `pixelRatio` |  | `1` |
| `screenBox` | | `[0,0,gl.drawingBufferWidth/pixelRatio,gl.drawingBufferHeight/pixelRatio]` |
| `viewBox` | | `[0,0,0,0]` |
| `dataBox` | | `[0,0,0,0]` |

##### Border and background colors

| Property | Description | Default |
|----------|-------------|---------|
| `borderColor` | | `` |
| `backgroundColor` | | `` |
| `borderLineEnable` | | `[true,true,true,true]` |
| `borderLineWidth` | | `[2,2,2,2]` |
| `borderLineColor` | | `[[0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1]]` |

##### Ticks

A general note on ticks

| Property | Description | Default |
|----------|-------------|---------|
| `ticks` |   | `[[], []]` |
| `tickEnable` |   | `[true, true, true, true]` |
| `tickPad` |   |  `[15,15,15,15]` |
| `tickAngle` |   | `[0,0,0,0]` |
| `tickColor` |   | `[[0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1]]`
| `tickMarkWidth` |    | `[0,0,0,0]` |
| `tickMarkLength` |    | `[0,0,0,0]` |

##### Labels

| Property | Description | Default |
|----------|-------------|---------|
| `labels` |   | `['x', 'y']` |
| `labelSize` |   | `[12, 12]` |
| `labelFont` |   | `['sans-serif', 'sans-serif']` |

##### Title

| Property | Description | Default |
|----------|-------------|---------|
| `title` |   | `''` |
| `titleFont` |   | `'sans-serif'` |
| `titleFont` |   | `'sans-serif'` |
| `titleSize` |   | `18` |

##### Grid lines

| Property | Description | Default |
|----------|-------------|---------|
| `gridLineEnable` |   | `[true, true]` |
| `gridLineColor` |  | `[[0,0,0,0.5], [0,0,0,0.5]]` |
| `gridLineWidth` |  | `[1, 1]` |
| `zeroLineEnable` |  | `[true, true]` |
| `zeroLineWidth` |  | `[2, 2]` |
| `zeroLineColor` |  | `[[0,0,0,1], [0,0,0,1]]` |

### Methods

#### `plot.update(options)`

#### `plot.setScreenBox(box)`

#### `plot.setViewBox(box)`

#### `plot.setDataBox(box)`

#### `plot.setSpike(x, y)`

#### `plot.draw()`

#### `plot.dispose()`


# License
(c) Mikola Lysenko.  MIT License

Supported by [plot.ly](http://plot.ly)
