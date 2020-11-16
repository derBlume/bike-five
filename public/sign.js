const signatureCanvas = document.getElementById("signatureCanvas");
let signatureData = document.getElementById("signatureData");
const sign = signatureCanvas.getContext("2d");

/* let drawing = false;
function beginSignature(event) {
    let x = event.pageX - event.target.offsetLeft;
    let y = event.pageY - event.target.offsetTop;
    drawing = true;
    sign.moveTo(x, y);
    sign.beginPath();
} */

function drawSignature(event) {
    //let x = event.layerX - event.target.offsetLeft;
    //let y = event.layerY - event.target.offsetTop;
    let x = event.offsetX;
    let y = event.offsetY;
    console.log(x, y, event.buttons);
    console.log(event);
    if (event.buttons) {
        sign.lineTo(x, y);
        sign.stroke();
        signatureData.value = signatureCanvas.toDataURL();
    } else {
        sign.moveTo(x, y);
        sign.beginPath();
    }
}

/* function endSignature() {
    drawing = false;
} */

//signatureCanvas.addEventListener("mousedown", beginSignature);
signatureCanvas.addEventListener("mousemove", drawSignature);
//signatureCanvas.addEventListener("mouseup", endSignature);
