leds = []
for (i=0; i < 8; i++) {
  leds[i] = 0
}


cp = require('child_process').spawn
process8x8 = cp('./8x8process')

exports.updateOneLedRow = function (row) {
  data = row << 1;
  value = ((leds[row] & 0xFE) >> 1) | ((leds[row] & 1) << 7)
  cmd = 'i2cset -y 1 0x70 ' + data + ' ' + value + '\n'
  process8x8.stdin.write(cmd)
}

exports.displayAllLeds = function () {
  for (row = 0; row < 8; row++) {
    exports.updateOneLedRow(row)
  }
}

exports.setRow = function (row, value) {
  leds[row] = value;
}

exports.setLed = function (theled) {
  col = theled % 8;
  row = (theled - col) / 8;
  leds[row] |= (1 << col);
}

exports.clearLed = function (theled) {
  col = theled % 8;
  row = (theled - col) / 8;
  leds[row] &= (~(1 << col)) & 0xFF
}

exports.dimLeds = function ( percentage ) {
  if (percentage > 1) {
    // assume values 1.01 to 100
    value = (percentage - 1) / (100 / 16)
  } else {
    // assume values 0.1 to 1.00
    value = (percentage - 0.001) * 16
  }
  temp = value % 1
  value -= temp
  if (value < 0) { value = 0 } else if (value > 15) { value = 15 }
  value += 0xE0
  cmd = 'i2cset -y 1 0x70 ' + value + '\n'
  process8x8.stdin.write(cmd)
}

exports.displayAllLeds()
