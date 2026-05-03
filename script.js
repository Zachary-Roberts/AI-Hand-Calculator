var videoElement = document.getElementById('webcam');
var canvasElement = document.getElementById('canvas');
var canvasCtx = canvasElement.getContext('2d');
var resultText = document.getElementById('result');
var checkbox = document.getElementById("myCheckbox");

function countFingers(landmarks, handLabel) {
    var count = 0;
    var tips = [8, 12, 16, 20];
    var base = [6, 10, 14, 18];

    if (handLabel === "Right") {
        if (landmarks[4].x < landmarks[3].x) count++;
    } else {
        if (landmarks[4].x > landmarks[3].x) count++;
    }

    for (var i = 0; i < tips.length; i++) {
        if (landmarks[tips[i]].y < landmarks[base[i]].y) count++;
    }

    return count;
}

function add(a,b){ return a+b; }
function multiply(a,b){ return a*b; }
function subtract(a,b){ return a-b; }

function calculateAll(l,r){
    return {
        sum:add(l,r),
        product:multiply(l,r),
        diff:subtract(l,r)
    };
}

function buildOutput(l,r,text){
    var res = calculateAll(l,r);

    var out = "";
    out += text + "\n";
    out += "\n" + l + " + " + r + " = " + res.sum;
    out += "\n" + l + " x " + r + " = " + res.product;
    out += "\n" + l + " - " + r + " = " + res.diff;

    return out;
}

var hands = new Hands({
    locateFile: file => "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file
});

hands.setOptions({
    maxNumHands:2,
    modelComplexity:1,
    minDetectionConfidence:0.7,
    minTrackingConfidence:0.7
});

hands.onResults(function(results){
    canvasCtx.save();
    canvasCtx.clearRect(0,0,canvasElement.width,canvasElement.height);
    canvasCtx.drawImage(results.image,0,0,canvasElement.width,canvasElement.height);

    var left=0,right=0,text="";

    if(results.multiHandLandmarks){
        for(let i=0;i<results.multiHandLandmarks.length;i++){
            let lm=results.multiHandLandmarks[i];
            let hand=results.multiHandedness[i].label;

            if(checkbox.checked){
                drawConnectors(canvasCtx,lm,HAND_CONNECTIONS,{color:'#0f0'});
                drawLandmarks(canvasCtx,lm,{color:'#f00'});
            }

            let count=countFingers(lm,hand);
            text+=hand+" hand: "+count+" fingers\n";

            if(hand==="Left") left=count;
            else right=count;
        }

        resultText.innerText = buildOutput(left,right,text);
    } else {
        resultText.innerText="No hand detected";
    }

    canvasCtx.restore();
});

var camera = new Camera(videoElement,{
    onFrame: async ()=>{ await hands.send({image:videoElement}); },
    width:640,
    height:480
});

camera.start();
