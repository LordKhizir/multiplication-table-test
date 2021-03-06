var number = [0,1,2];
var boxContent = [0,1,2]; // 1 is first number, 2 is second number, 0 is result
var upTo = [0,10,10];
var guess = 0;
var operation = 'x';
var maxSeconds = 0;
var maxOperations = 0;
var GLOBAL_removeZeroes = 0;
var counterOK = 0;
var counterKO = 0;
var resultTable;
var GLOBAL_finished = 0;
var secondsInterval = 0;
var LAPSE_BETWEEN_OPERATIONS = 400;

initialize();

function initialize() {
  // Recover parameters
  upTo[1] = getParameterByName('firstNumber',10);
  upTo[2] = getParameterByName('secondNumber',10);
  var operationCode = getParameterByName('operation','MULT');
  if (operationCode=='MULT') {
    operation = 'x'
  } else {
    operation = '+'
  }
  maxSeconds = getParameterByName('maxSeconds',0);
  maxOperations = getParameterByName('maxOperations',0);
  GLOBAL_removeZeroes = getParameterByName('removeZeroes',0);

  // Initialize counters
  counterOK = 0;
  counterKO = 0;
  remainingSeconds = maxSeconds;
  GLOBAL_remainingOperations = maxOperations;

  // UI initialization
  writeById('operation', operation);
  writeById('counter-operations', GLOBAL_remainingOperations);
  updateTime(remainingSeconds);
  document.getElementById('play-area').className = '';
  generateResultTable(upTo[1],upTo[2]);

  var supportsTouch = ("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
  if (!supportsTouch) {
    document.querySelector('.keyboard').className = 'hidden';
  }


  // set events, timeouts, intervals...
  addEvent(window, "keyup", eventHub);
  document.querySelectorAll('.keyboard button').forEach(element => {
    addEvent(element, "click", eventHub);
  });

  if (maxSeconds>0) {
    secondsInterval = setInterval(function() {oneSecondPassed()}, 1000);
  }

  // Go on
  newOperation();
}

function oneSecondPassed() {
  remainingSeconds--;
  updateTime(remainingSeconds);
  if (remainingSeconds==0) {
    testFinished();
  }
}

function updateTime(seconds) {
  var minutesAndSeconds = Math.floor(remainingSeconds/60) + 'm' + (remainingSeconds%60) + 's';
  writeById('counter-time', minutesAndSeconds);
}

function testFinished() {
  // Disable intervals, key events, etc
  GLOBAL_finished = 1;
  if (secondsInterval) {
    clearInterval(secondsInterval);
  }
  document.getElementById('chalkboard').className='hidden'; //hide
  document.getElementById('interface').className='hidden'; //hide
  document.getElementById('results').className='results'; //remove hidden attribute

  // Add result analysis
  var resultsDescription = document.getElementById('result-description');
  resultsDescription.innerHTML+=
    'Aciertos:' + counterOK + '<br/>' +
    'Errores:' + counterKO + '<br/>';
}

function newOperation() {
  var minValue = 0;
  if (GLOBAL_removeZeroes) {
    minValue = 1;
  }
  number[1] = getRandomInt(minValue,upTo[1]);
  number[2] = getRandomInt(minValue,upTo[2]);
  var gotBackOnce = 0;
  // ONLY use this number if it has not been asked yet
  while (resultTable[number[1]][number[2]]!=0) {
    if (number[1]<upTo[1]) {
      number[1]++;
    } else if (number[2]<upTo[2]) {
      number[1]=0;
      number[2]++;
    } else {
      if (gotBackOnce==1) {
          testFinished();
          return;
      } else {
        number[1]=0;
        number[2]=0;
        gotBackOnce = 1;
      }
    }
  }

  switch(operation) {
    case '+': number[0] = number[1] + number[2];
      break;
    case 'x': number[0] = number[1] * number[2];
        break;
  }
  guess = 0;
  for (var i=0;i<3;i++) {
    boxContent[i] = number[i];
  }
  elementToGuess = getRandomInt(0,2);
  boxContent[elementToGuess]='?';
  for (var i=0;i<=2;i++) {
    showNumberContent(i,boxContent[i]);
  }
}

function processDigit(digit) {
  guess = guess * 10 + digit;
  showNumberContent(elementToGuess,guess);
  // Same number of digits?
  var bypassZero = (operation=='x' && number[0]==0 && elementToGuess!=0);
  if ((guess.toString().length == number[elementToGuess].toString().length) || bypassZero){
      processResult(guess==number[elementToGuess] || bypassZero );
      completedOperation();
  }
}

function clearGuess() {
  guess = 0;
  showNumberContent(elementToGuess,'?');
}

function completedOperation () {
  GLOBAL_remainingOperations--;
  writeById('counter-operations', GLOBAL_remainingOperations);
  if (GLOBAL_remainingOperations==0) {
    testFinished()
  } else {
    setTimeout('newOperation();',LAPSE_BETWEEN_OPERATIONS); // Leave a little time, just for visual feedback
  }
}

function animateCounter(counterId) {
  var elem = document.getElementById(counterId);
  var originalClassname = elem.className.replace(' animation-counter-increase','');
  elem.className = originalClassname;
  setTimeout(function () {
    elem.className = originalClassname + ' animation-counter-increase';
  }, 100);
}

function processResult(result) {
  var resultCellKey = 'result-' + number[1] + '-' + number[2];
  if (result) {
    document.getElementById(resultCellKey).className = 'cell-ok';
    resultTable[number[1]][number[2]] = 1;
    counterOK = counterOK + 1;
    animateCounter('img-counter-ok');
    writeById('counter-ok',counterOK);
  } else {
    document.getElementById(resultCellKey).className = 'cell-ko';
    resultTable[number[1]][number[2]] = -1;
    counterKO = counterKO + 1;
    animateCounter('img-counter-ko');
    writeById('counter-ko',counterKO);
  }
}

function eventHub(e) {
  const ASCII_0 = 48;
  const ASCII_9 = 57;
  const ASCII_BACKSPACE = 8;
  if (GLOBAL_finished==1) return;
  switch (e.type) {
    case 'keyup':
      if(e.which >=ASCII_0 && e.which<=ASCII_9){// NUMBER key pressed
        var digit = e.which - ASCII_0;
        processDigit(digit);
      } else if (e.which==ASCII_BACKSPACE){
        clearGuess();
      }
      break;
    case 'click':
      var digit = e.srcElement.innerText;
      if (digit>='0' && digit<='9') {
        processDigit(parseInt(digit));
      } else if (digit=='Borrar') {
        clearGuess();
      }
      break;
  }
}


function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

function showNumberContent(index, content) {
  writeById('number-' + index, content);
}

/* Generate result table, PLUS its representation */
function generateResultTable(firstNumber, secondNumber) {
  resultTable = new Array(firstNumber);
  var table = document.getElementById('result-table');
  for (var y=0;y<=firstNumber;y++) {
    var row = table.insertRow(y);
    resultTable[y] = new Array(secondNumber);
    for (var x=0;x<=secondNumber;x++) {
      var cell = row.insertCell(x);
      cell.id = 'result-' + y + '-' + x;
      cell.innerHTML = y + 'x' + x;
      if (GLOBAL_removeZeroes==1 && (x==0 || y==0)) {
        resultTable[y][x] = -2; // -2 means "NOT ASKED"
        cell.className = 'cell-notasked';
      } else {
        resultTable[y][x] = 0; // 0 means "not set yet"
        cell.className = 'cell-pending';
      }
    }
  }
}

/* Utils functions - domain agnostic */


function writeById(id,content) {
  document.getElementById(id).innerHTML = content;
}

function getParameterByName(name, defaultValue) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return defaultValue;
    if (!results[2]) return defaultValue;
    var paramValue = decodeURIComponent(results[2].replace(/\+/g, " "));
    if (paramValue) {
      return paramValue;
    } else {
      return defaultValue;
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
