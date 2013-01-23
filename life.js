var led8x8 = require('./8x8')

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
//console.log("next Life");
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
//console.log("row="+row+" col="+col+" alive");
	}
      } else {
	if (lifeCount == 3) {
	  nextLife[row][col] = 1;
//console.log("row="+row+" col="+col+" alive");
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
        led8x8.setLed(row * 8 + col);
      } else {
        led8x8.clearLed(row * 8 + col);
      }
    }
  }
  led8x8.displayAllLeds()
}

var dim = 100
console.log('Starting Life');
setInterval(function() {
  copyLifeToLeds()
  updateLife()
  copyNextLifeToLife()
  dim -= 1
  if (dim < 1) { dim = 100; }
  led8x8.dimLeds(dim)
}, 1000)
