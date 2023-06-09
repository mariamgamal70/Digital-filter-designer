const deleteButton = document.getElementById("delete");
const addZeroButton = document.getElementById("zero");
const addPoleButton = document.getElementById("pole");
const conjugateButton = document.getElementById("conjugate");
const clearAllButton = document.getElementById("clearall");
const canvasContainer = document.getElementById("canvascontainer");
let unitCircleCanvas = document.getElementById("unitcirclecanva");
let lastAddedElement = null;
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
  if (addZeroButton.checked) {
    createZero(x, y);
    lastAddedElement = zeros[zeros.length - 1];
    conjugateButton.removeEventListener("click", conjugatePoleHandler);
    conjugateButton.addEventListener("click", conjugateZeroHandler);
  } else if (addPoleButton.checked) {
    createPole(x, y);
    lastAddedElement = poles[poles.length - 1];
    conjugateButton.removeEventListener("click", conjugateZeroHandler);
    conjugateButton.addEventListener("click", conjugatePoleHandler);
  }
  applyFilter();
});

clearAllButton.addEventListener("click", clearAll);

function conjugatePoleHandler() {
  createPole(lastAddedElement.x, 300 - lastAddedElement.y,true);
  // lastAddedElement.conjugate = true;
}

function conjugateZeroHandler() {
  createZero(lastAddedElement.x, 300 - lastAddedElement.y,true);
  // lastAddedElement.conjugate = true;
}

function createZero(x, y,conjugate=false) {
  const zero = document.createElement("div");
  zero.className = "zero";
  zero.style.left = x - 5 + "px";
  zero.style.top = y - 5 + "px";
  canvasContainer.appendChild(zero);
  zeros.push({ element: zero, x: x, y: y, conjugate: conjugate });
  zero.addEventListener("click", () => {
    if (deleteButton.checked) {
      canvasContainer.removeChild(zero);
      zeros = zeros.filter((item) => item.element !== zero);
      getFrequencyResponse();
      applyFilter();
    }
  });
  dragElement(zero);
  convertToPolarCoordinates();
  getFrequencyResponse();
}

function createPole(x, y, conjugate = false) {
  const pole = document.createElement("div");
  pole.className = "pole";
  pole.style.left = x - 5 + "px";
  pole.style.top = y - 5 + "px";
  canvasContainer.appendChild(pole);
  poles.push({ element: pole, x: x, y: y, conjugate: conjugate });
  pole.addEventListener("click", () => {
    if (deleteButton.checked) {
      canvasContainer.removeChild(pole);
      poles = poles.filter((item) => item.element !== pole);
      getFrequencyResponse();
      applyFilter();
    }
  });
  dragElement(pole);
  convertToPolarCoordinates();
  getFrequencyResponse();
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
    console.log(
      "element.offsetTop",
      element.offsetTop,
      "element.offsetLeft",
      element.offsetLeft
    );
    // Update the x and y coordinates in the corresponding shape object
    const shapeIndex = zeros.findIndex((item) => item.element === element);
    if (shapeIndex !== -1) {
      zeros[shapeIndex].x = element.offsetLeft;
      zeros[shapeIndex].y = element.offsetTop;
      if (zeros[shapeIndex + 1] && zeros[shapeIndex + 1].conjugate == true) {
        zeros[shapeIndex + 1].x = zeros[shapeIndex].x;
        zeros[shapeIndex + 1].y = 290 - zeros[shapeIndex].y;
        zeros[shapeIndex + 1].element.style.top =
          290-zeros[shapeIndex].y  + "px";
        zeros[shapeIndex + 1].element.style.left = zeros[shapeIndex].x + "px";
      }
    } else {
      const shapeIndex = poles.findIndex((item) => item.element === element);
      if (shapeIndex !== -1) {
        poles[shapeIndex].x = element.offsetLeft;
        poles[shapeIndex].y = element.offsetTop;
        if (poles[shapeIndex + 1] && poles[shapeIndex + 1].conjugate == true) {
          poles[shapeIndex + 1].x = poles[shapeIndex].x;
          poles[shapeIndex + 1].y = 290 - poles[shapeIndex].y;
          poles[shapeIndex + 1].element.style.top =
            290 - poles[shapeIndex].y + "px";
          poles[shapeIndex + 1].element.style.left = poles[shapeIndex].x + "px";
        }
      }
    }
    convertToPolarCoordinates();
    getFrequencyResponse();
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function clearZeros() {
  zeros.forEach((zero) => canvasContainer.removeChild(zero.element));
  zeros = [];
}

function clearPoles() {
  poles.forEach((pole) => canvasContainer.removeChild(pole.element));
  poles = [];
}

function clearAll() {
  clearZeros();
  clearPoles();
  Plotly.deleteTraces(magnitudeGraph, 0);
  Plotly.deleteTraces(phaseGraph, 0);
  outputSignal = uploadedSignal;
  // startOutputInterval();
}

function convertToPolarCoordinates() {
  const shapes = [...zeros, ...poles]; // Combine zeros and poles into a single array
  for (let shape of shapes) {
    let x = ((shape.x - 150) / 150).toFixed(1); // Calculate the center x-coordinate of the shape and round to 2 decimal places
    let y = ((150-shape.y) / 150).toFixed(1); // Calculate the center y-coordinate of the shape and round to 2 decimal places
    // console.log(" x", x);
    // console.log(" y", y);

    // Convert the x and y coordinates to polar coordinates
    const radius = Math.sqrt((x) ** 2 + (y) ** 2); // Distance from shape center to circle center (assumed to be 150, 150)
    const angle = Math.atan2(y, x); // Angle in radians
    // Store the polar coordinates in the shape's data attributes
    shape.radius = radius;
    shape.angle = angle;
  }
}

function convertPolarToComplex() {
  let realZeros = zeros.map(zero => zero.radius * Math.cos(zero.angle));
  let realPoles = poles.map(pole => pole.radius * Math.cos(pole.angle));
  let imgZeros = zeros.map(zero => zero.radius * Math.sin(zero.angle));
  let imgPoles = poles.map((pole) => pole.radius * Math.sin(pole.angle));
  return {
    realZeros: realZeros,
    realPoles: realPoles,
    imgZeros: imgZeros,
    imgPoles: imgPoles,
  };
}

function getFrequencyResponse() {
  applyFilter();
  const complexForm = convertPolarToComplex();
  const formData = new FormData();
  formData.append("realZeros", complexForm.realZeros);
  formData.append("realPoles", complexForm.realPoles);
  formData.append("imgZeros", complexForm.imgZeros);
  formData.append("imgPoles", complexForm.imgPoles);
  fetch("/getMagnitudeAndPhase", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const magTrace = {
        x: data.frequency,
        y: data.magnitude,
        type: "scatter",
        name: "Magnitude",
      };
      const phaseTrace = {
        x: data.frequency,
        y: data.phase,
        type: "scatter",
        name: "Phase",
      };
      // Update the magnitude plot with the magnitude data
      if (magnitudeGraph.data.length == 0) {
        Plotly.addTraces(magnitudeGraph, magTrace);
      } else {
        Plotly.deleteTraces(magnitudeGraph, 0);
        Plotly.addTraces(magnitudeGraph, magTrace);
      }
      // Update the phase plot with the phase data
      if (phaseGraph.data.length == 0) {
        Plotly.addTraces(phaseGraph, phaseTrace);
      } else {
        Plotly.deleteTraces(phaseGraph, 0);
        Plotly.addTraces(phaseGraph, phaseTrace);
      }
      // update the original phase in all-pass filter pop-up menu 
      if (OriginalPhaseGraph.data.length == 0) {
        Plotly.addTraces(OriginalPhaseGraph, phaseTrace);
      } else {
        Plotly.deleteTraces(OriginalPhaseGraph, 0);
        Plotly.addTraces(OriginalPhaseGraph, phaseTrace);
      }
    })
    .catch((error) => {
      // Handle errors, e.g. display an error message to the user
      console.error("Error fetching frequency response:", error);
    });
}

function plotAllPassFilterResponse() {
    const formData = new FormData();
    const complexNumber = listItemArray[listItemArray.length-1].toString();
    console.log(complexNumber);
    formData.append("complexno", complexNumber);
  fetch("/getAllPass", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      const allPassResponseTrace = {
        x: data.frequency,
        y: data.allpassresponse,
        type: "scatter",
        name: "AllPass response",
      };
       if (allPassResponse.data.length == 0) {
         Plotly.addTraces(allPassResponse, allPassResponseTrace);
       } else {
         Plotly.deleteTraces(allPassResponse, 0);
         Plotly.addTraces(allPassResponse, allPassResponseTrace);
       }
    });
}


document.getElementById('applyPhaseCorrection').addEventListener('click', function() {
  applyAllPassFilter();
  updateOutputAllpass();
});

function updateOutputAllpass() {
    const formData = new FormData();
    formData.append("filters", listItemArray);
    formData.append("amplitude", uploadedSignal.y);
  fetch("/allPassOuput", {
    method: "POST",
    body: formData,
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Request failed with status " + response.status);
      }
    })
    .then(function (responseData) {
      console.log("be4",outputSignal);
      outputSignal = { x: uploadedSignal.x, y: responseData.filteredData };
      console.log("after", outputSignal);
      startOutputInterval();
    });
  }



function applyAllPassFilter() {
    const formData = new FormData();
    formData.append("filters", listItemArray);
  fetch("/allPass_originalPhase", {
    method: "POST",
    body: formData,
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Request failed with status " + response.status);
      }
    })
    .then(function (responseData) {
      const totalPhase = {
        x: responseData.frequency,
        y: responseData.total_phase,
        type: "scatter",
        name: "PhaseCorrection",
      };

      if (OriginalPhaseGraph.data.length == 0) {
        Plotly.addTraces(OriginalPhaseGraph, totalPhase);
      } else {
        Plotly.deleteTraces(OriginalPhaseGraph, 0);
        Plotly.addTraces(OriginalPhaseGraph, totalPhase);
      }
      if (phaseGraph.data.length==0){
        Plotly.addTraces(phaseGraph, totalPhase);
      } else {
        Plotly.deleteTraces(phaseGraph, 0);
        Plotly.addTraces(phaseGraph, totalPhase);
      }
      
    })
    .catch(function (error) {
      console.error("Error:", error);
      // Handle any error that occurred during the request
    });
}