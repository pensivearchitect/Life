var ipaddr = "192.160.12.221"

var express = require('express')
var app = express()
app.listen(8124)

var state = 0

var counter = 0;

var leds = []
for (i=0; i < 8; i++) {
  leds[i] = 0
}

function updateOneLedRow(row) {
  setRow = require('child_process')
  data = row << 1;
  value = ((leds[row] & 0xFE) >> 1) | ((leds[row] & 1) << 7)
  setRow.exec('i2cset -y 1 0x70 ' + data + ' ' + value, function(e, stdout, stderr) {
    if (!e) {
      console.log(stdout);
      console.log(stderr);
    }
    counter++;
    console.log("8x8 set led row=" + row + " led=" + leds[row] + " value=" + value);
  });
}

function displayAllLeds() {
  for (row = 0; row < 8; row++) {
    updateOneLedRow(row)
  }
}

function setRow(row, value) {
  leds[row] = value;
}

function setLed(theled) {
  col = theled % 8;
  row = (theled - col) / 8;
  leds[row] |= (1 << col);
}

function clearLed(theled) {
  col = theled % 8;
  row = (theled - col) / 8;
  leds[row] &= (~(1 << col)) & 0xFF
}

var init8x8 = require('child_process')
init8x8.exec('~/8x8init', function(e, stdout, stderr) {
  if (!e) {
    console.log(stdout);
    console.log(stderr);
  }
  console.log("8x8 initialized");
  displayAllLeds()
});

var life = new Array() 
var nextLife = new Array()
for (row = 0; row < 8; row++) {
  life[row] = new Array()
  nextLife[row] = new Array()
  for (col = 0; col < 8; col++) {
    life[row][col] = 0
  }
}

life[0][1] = 1;
life[1][2] = 1;
life[2][0] = 1;
life[2][1] = 1;
life[2][2] = 1;

function updateLife() {
console.log("next Life");
  for (row = 0; row < 8; row++) {
    for (col = 0; col < 8; col++) {
      lifeCount = 0;
//console.log("row="+row+" col="+col);
      for (r = row - 1; r <= row + 1; r++) {
        for (c = col - 1; c <= col + 1; c++) {
          therow = (r % 8)
	  thecol = (c % 8)
	  if (therow < 0) { therow = 7; }
	  if (thecol < 0) { thecol = 7; }
          if ((therow != row) || (thecol != col)) {
	    if (life[therow][thecol]) {
//console.log("alive checking therow="+therow+" thecol="+thecol+" count="+lifeCount);
	      lifeCount++;
	    }
	  }
else {
//console.log("dead  checking therow="+therow+" thecol="+thecol+" count="+lifeCount);
}
	}
      }
      nextLife[row][col] = 0;
      if (life[row][col]) {
	if (lifeCount == 2 || lifeCount == 3) {
	  nextLife[row][col] = 1;
console.log("row="+row+" col="+col+" alive");
	}
      } else {
	if (lifeCount == 3) {
	  nextLife[row][col] = 1;
console.log("row="+row+" col="+col+" alive");
	}
      }
    }
  }
}

function copyNextLifeToLife() {
  for (row = 0; row < 8; row++) {
    for (col = 0; col < 8; col++) {
      life[row][col] = nextLife[row][col]
    }
  }
}

function copyLifeToLeds() {
  for (row = 0; row < 8; row++) {
    for (col = 0; col < 8; col++) {
      if (life[row][col]) {
        setLed(row * 8 + col);
      } else {
        clearLed(row * 8 + col);
      }
    }
  }
  displayAllLeds()
}

app.get('/', function(req,res){
  res.send('Welcome to NODE 8x8')
 // clearLed(state);
 // state = (state + 1) % 64;
 // setLed(state);
 // displayAllLeds();
  copyLifeToLeds()
  updateLife()
  copyNextLifeToLife()
})


app.post('/toggle', express.bodyParser(), function(req, res) {
  if (req.body && req.body.leds) {
    res.send({status:"ok", message:"LEDS updated"})
  } else {
    res.send({status:"nok", message:"No LED states sent"})
  }
})

console.log('Server running at http://' + ipaddr + ':8124');
savedCounter = -1;
for (k = 0; k < 1000; k++) {
  copyLifeToLeds()
  updateLife()
  copyNextLifeToLife()
  while (savedCounter == counter) {
    // wait for callback to complete
  }
  savedCounter = counter;
}

