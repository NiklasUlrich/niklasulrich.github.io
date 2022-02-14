var videoElement = document.querySelector("#videoElement");
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const main_canvas = document.getElementsByClassName('main_canvas')[0];
const ctx2 = main_canvas.getContext('2d');
const movie = document.getElementsByClassName('movie')[0];
const image = document.getElementById('startimage');

movie.style.display = "none";
canvasElement.style.display = "none";
videoElement.style.display = "none";
main_canvas.style.display = "none";


//initalizes the webcam video feed
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      videoElement.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}

var net;

(async function(){
  net = await bodyPix.load({
    //ResNet (larger, slower, more accurate) **new!**
    /*architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2*/
  
    //MobileNet (smaller, faster, less accurate)
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
    
  });
})()

//parameters for the drawmask-function
let mask = null;
const opacity = 1;
const flipHorizontal = true;
const maskBlurAmount = 3;

//is called as often as possible to update the canvas with data from the video feed
const updateCanvas = (now, metadata) => {
  var startTime;
  if (startTime === 0.0) {
    startTime = now;
  }

  canvasElement.width = metadata.width;
  canvasElement.height = metadata.height;


  ctx2.clearRect(0, 0, canvasElement.width, canvasElement.height);


  ctx2.drawImage(movie, 0, 0, main_canvas.width, main_canvas.height);

  if(mask){
  bodyPix.drawMask(canvasElement, canvasElement, mask, opacity, maskBlurAmount,
      flipHorizontal)
  };
  canvasCtx.restore();

  ctx2.drawImage(canvasElement, 0, 0, main_canvas.width, main_canvas.height);
  ctx2.restore();

  videoElement.requestVideoFrameCallback(updateCanvas);
};



const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
const backgroundColor = {r: 0, g: 0, b: 0, a: 255};

async function segmentLoop(now, metadata) {
  videoElement.width = metadata.width;
  videoElement.height = metadata.height;
  const segmentation = await net.segmentPerson(videoElement, {
    flipHorizontal: false,
    internalResolution: 'full',
    segmentationThreshold: .7
  
  });
 
  mask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
  
  videoElement.requestVideoFrameCallback(segmentLoop);
}
/*
ctx2.fillStyle = "white";
ctx2.font = "30px Arial"
ctx2.fillText("To start the prototype, click", 10, 50);

*/
image.onclick = function(){
  console.log("starting prototype");

  image.style.display = "none";
  main_canvas.style.display = "block";


  movie.play();
  movie.volume = 0.2;
  //start the canvas-"video"
  videoElement.requestVideoFrameCallback(updateCanvas);
  videoElement.requestVideoFrameCallback(segmentLoop);
}


