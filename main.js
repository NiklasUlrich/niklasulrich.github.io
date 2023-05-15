const image = document.getElementById('startimage');
var stocks = new Stocks('IC5PFAWJJQF1CR5L');

let audioctx = null

function playNote(freq){
    if(audioctx==null){
        audioctx = new(AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }
    const dur = 0.2;
    const osc = audioctx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioctx.currentTime+dur);

    const node =audioctx.createGain();
    node.gain.value = 0.4;
    node.gain.linearRampToValueAtTime(0, audioctx.currentTime+dur);
    osc.connect(node);
    node.connect(audioctx.destination);
}

async function request () {
    var result = await stocks.timeSeries({
      symbol: 'TSLA',
      interval: '1min',
      amount: 1000
     });
  
     console.log(result);
     return(result);
}

const minFreq = 50;
const maxFreq = 3000;

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function playEntries(stockData, highest, lowest){

    var range = highest - lowest

    for(var i = 0; i < stockData.length; i++){
        var data = stockData[i].open;
        var dial = (data - lowest) / range;

        console.log(data + ", dial to " + dial);

        var freq = (dial * (maxFreq - minFreq) ) + minFreq;

        console.log("playing " + freq);
        
        playNote(freq);

        await delay(100);
    }
}

async function playStock(){
    var stockData = await request();
    var lowest = stockData[0].open;
    var highest = lowest;
    for(var i = 0; i < stockData.length; i++ ){
        var data= stockData[i].open;
        if(data < lowest) lowest = data;
        if(data > highest) highest = data;
    }
    console.log("highest: " + highest);
    console.log("lowest: " + lowest);

    playEntries(stockData, highest, lowest);
}

image.onclick = function(){
    playStock();
}
