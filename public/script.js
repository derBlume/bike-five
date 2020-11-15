const lines = document.querySelectorAll(".line");
function drawLine() {
    for (let line of lines) {
        let lineLength = 0;
        while (lineLength <= line.offsetWidth + 400) {
            let dash = document.createElement("DIV");
            dash.classList.add("dash");
            line.appendChild(dash);
            lineLength = lineLength + dash.offsetWidth;
        }
    }
}

drawLine();

const inputFields = document.querySelectorAll(".content form .fields input"); // [input1, input2, input3]
const inputLabels = document.querySelectorAll(".content form .fields label"); // [label1, label2, label3]

function toggleLabel() {
    for (let i = 0; i < inputFields.length; i++) {
        inputFields[i].addEventListener("focus", () => {
            inputLabels[i].classList.add("show");
        });
        inputFields[i].addEventListener("blur", () => {
            inputLabels[i].classList.remove("show");
        });
    }
}

toggleLabel();
