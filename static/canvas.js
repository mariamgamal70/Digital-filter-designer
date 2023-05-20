const deleteButton = document.getElementById("delete");
const addZeroButton = document.getElementById("zero");
const addPoleButton = document.getElementById("pole");
const conjugateButton = document.getElementById("conjugate");
const clearAllButton = document.getElementById("clearall");
const canvasContainer = document.getElementById("canvascontainer");
let unitCircleCanvas = document.getElementById("unitcirclecanva");
let lastAddedElement=null;
let zeros = [];
let poles = [];

let context = unitCircleCanvas.getContext("2d");
context.beginPath();
context.arc(150, 150, 150, 0, 2 * Math.PI);
context.stroke();
context.moveTo(0, 150);
context.lineTo(300, 150);
context.stroke();
context.moveTo(150, 0);
context.lineTo(150, 300);
context.stroke();
context.closePath();

unitCircleCanvas.addEventListener("click", (event) => {
  const rect = unitCircleCanvas.getBoundingClientRect();
  //client is distance from start of viewport till point clicked in the div
  //rect is the distance from the viewport till the start of the div
  //the difference between them is the distance from the start of div till point clicked
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log("x", x, "event.clientX", event.clientX, "rect.left", rect.left);
  console.log("y", y, "event.clientY", event.clientX, "rect.top", rect.top);
  if (addZeroButton.checked) {
    createZero(x, y);
    lastAddedElement = {element: zeros[zeros.length - 1], x:x,y:y};
    conjugateButton.removeEventListener("click", conjugatePoleHandler);
    conjugateButton.addEventListener("click", conjugateZeroHandler);
  } else if (addPoleButton.checked) {
    createPole(x, y);
    lastAddedElement = { element: poles[poles.length - 1], x: x, y: y };
    conjugateButton.removeEventListener("click", conjugateZeroHandler);
    conjugateButton.addEventListener("click", conjugatePoleHandler);
  }
});

clearAllButton.addEventListener("click", clearAll);

function conjugatePoleHandler(){
    const rectelement = lastAddedElement.element.getBoundingClientRect();
    const xelement = rectelement.left;
    const yelement = rectelement.top;
    console.log("pole", "xelement", xelement, "yelement", yelement);
    createPole(lastAddedElement.x, 300 - lastAddedElement.y);
}

function conjugateZeroHandler() {
    const rectelement = lastAddedElement.element.getBoundingClientRect();
    const xelement = rectelement.left;
    const yelement = rectelement.top;
    console.log("pole", "xelement", xelement, "yelement", yelement);
    createZero(lastAddedElement.x, 300 - lastAddedElement.y);
}

function createZero(x, y) {
  const zero = document.createElement("div");
  zero.className = "zero";
  zero.style.left = x - 5 + "px";
  zero.style.top = y - 5 + "px";
  canvasContainer.appendChild(zero);
  zeros.push(zero);
  zero.addEventListener("click", () => {
    if (deleteButton.checked) {
      canvasContainer.removeChild(zero);
      zeros = zeros.filter((item) => item !== zero);
    }
  });
  dragElement(zero);
}

function createPole(x, y) {
  const pole = document.createElement("div");
  pole.className = "pole";
  pole.style.left = x - 5 + "px";
  pole.style.top = y - 5 + "px";
  canvasContainer.appendChild(pole);
  poles.push(pole);
  pole.addEventListener("click", () => {
    if (deleteButton.checked) {
      console.log("hi");
      canvasContainer.removeChild(pole);
      poles = poles.filter((item) => item !== pole);
    }
  });
  dragElement(pole);
}

function dragElement(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function clearZeros() {
  zeros.forEach((zero) => canvasContainer.removeChild(zero));
  zeros = [];
}

function clearPoles() {
  poles.forEach((pole) => canvasContainer.removeChild(pole));
  poles = [];
}

function clearAll() {
  clearZeros();
  clearPoles();
}
