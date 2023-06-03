const image = document.getElementById('startimage');
var stocks = new Stocks('IC5PFAWJJQF1CR5L');
var twoDctx = image.getContext("2d");
twoDctx.fillStyle = "#000000";
twoDctx.fillRect(0, 0, 640, 360);
twoDctx.strokeStyle = "white";


//twoDctx.moveTo(0, 0);
//twoDctx.lineTo(200, 100);
//twoDctx.stroke();

const stockSymbols = [];
stockSymbols.push(
    "TSLA",
    "GOOGL",
    "OIL",
    "GOLD",

);

let audioctx = null;
let wave = null;

function playNote(freq){
    
    const dur = .4;

    const osc = audioctx.createOscillator();
    osc.setPeriodicWave(wave);

    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioctx.currentTime+dur);

    const node =audioctx.createGain();
    //node.gain.value = 0;
    //node.gain.linearRampToValueAtTime(.4, audioctx.currentTime+dur / 10);
    node.volume = 0.4;

    node.gain.linearRampToValueAtTime(0.00001, audioctx.currentTime+dur);
    osc.connect(node);
    node.connect(audioctx.destination);
}

var currentStock = 0;
async function request () {
    var result = await stocks.timeSeries({
      symbol: stockSymbols[currentStock],
      interval: '1min',
      amount: 1000
     });

     console.log("Stock: " + stockSymbols[currentStock])

     currentStock++;
     if(currentStock >= stockSymbols.length) currentStock = 0;
  
     return(result);
}

const minFreq = 50;
const maxFreq = 3000;

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function mapToCurve(stockData){
    var returnCurves = [];
    var highestHigh = stockData[0].high;
    var lowestHigh = highestHigh;
    var highestLow = stockData[0].low;
    var lowestLow = highestLow;

    var lowCurve = [];
    var highCurve = [];
    for(var i = 1; i < stockData.length; i++){
        var low = stockData[i].low;
        if(highestLow < low) highestLow = low;
        if(lowestLow > low) lowestLow = low;
        lowCurve.push(low);

        var high = stockData[i].high;
        if(highestHigh < high) highestHigh = high;
        if(lowestHigh > high) lowestHigh = high;
        highCurve.push(high);
    }

    var returnLowCurve = [];
    var returnHighCurve = [];
    for(var i = 0; i < lowCurve.length; i++){
        var returnLow = mapToRange(lowCurve[i], lowestLow, highestLow, -1.0, 1.0);
        returnLowCurve.push(returnLow);

        var returnHigh = mapToRange(highCurve[lowCurve.length - 1 - i], lowestHigh, highestHigh, -1.0, 1.0);
        returnHighCurve.push(returnHigh);
    }

    returnCurves.push(returnLowCurve, returnHighCurve);
    return returnCurves;
}

function createOscillatorWave(stockData){
    var curves = mapToCurve(stockData);
    const newWave = audioctx.createPeriodicWave(curves[0], curves[0]);
    drawCurve(curves[0]);
    return newWave;
}

function drawCurve(curve){
    twoDctx.clearRect(0, 0, image.width, image.height);
    twoDctx.beginPath();


    var height = image.height;
    var width = image.width;
    var numberOfEntries = curve.length;

    var stepSize = width/numberOfEntries;
    console.log("stepsize: " + stepSize);

    for(var i = 1; i < numberOfEntries; i++){
        twoDctx.moveTo(stepSize * (i - 1), height * ( (curve[i-1] + 1.0) / 2 ) );
        twoDctx.lineTo(stepSize * (i), height * ( (curve[i] + 1.0) / 2 ) );
        twoDctx.stroke();
    }
}

function mapToRange(value, minIn, maxIn, minRange, maxRange){
    var range = maxIn - minIn;
    var data = value;
    var dial = (data - minIn) / range;
    var ret = (dial * (maxRange - minRange) ) + minRange;

    return ret;
}

async function playEntries(stockData, highest, lowest){
    
    wave = createOscillatorWave(stockData, audioctx);

    for(var i = 0; i < stockData.length; i++){
        var freq = mapToRange(stockData[i].open, lowest, highest, minFreq, maxFreq);
        
        playNote(freq);

        await delay(100);
    }
}

async function playStock(){
    var stockData = await request();
    var lowest = stockData[0].open;
    var highest = lowest;
    for(var i = 1; i < stockData.length; i++ ){
        var data= stockData[i].open;
        if(data < lowest) lowest = data;
        if(data > highest) highest = data;
    }
    console.log("highest: " + highest);
    console.log("lowest: " + lowest);

    playEntries(stockData, highest, lowest);
}

image.onclick = function(){
    loadStock();
}

function loadStock(){
    if(audioctx==null){
        audioctx = new(AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }

    //playStock();
    bootKeyBoard(); 
}

async function bootKeyBoard(){
    console.log("booting keyboard")
    var stockData = await request();
    wave = createOscillatorWave(stockData, audioctx);

    document.addEventListener('keypress', (event) => {
        var freq;
        switch (event.key){
            case 'a': freq = 130.8; break;
            case 's': freq = 146.8; break;
            case 'd': freq = 164.8; break;
            case 'f': freq = 174.6; break;
            case 'g': freq = 196.0; break;
            case 'h': freq = 220.0; break;
            case 'j': freq = 246.9; break;

            case 'c': loadStock(); return; 
            default: return;
        }
        playNote(freq);
      }, false);
   // document.addEventListener("keyup", onKeyUp(wave));
}


function onKeyUp(wave){

}