const magnitudeGraph = document.getElementById("magnitude");
const phaseGraph = document.getElementById("phase");
const inputSignalGraph = document.getElementById("inputsignal");
const outputSignalGraph = document.getElementById("outputsignal");
const graphSpeed = document.getElementById("speed");
const uploadSignal=document.getElementById("uploadsignal")
const canvasContainer = document.getElementById("canvascontainer");
let zeros = [];
let poles = [];
let time=50;

let unitCircleCanvas = document.getElementById("unitcirclecanva");
let context = unitCircleCanvas.getContext("2d");
    context.beginPath();
    context.arc(150, 150, 100, 0, 2 * Math.PI);
    context.stroke();
    context.moveTo(0, 150);
    context.lineTo(300, 150);
    context.stroke();
    context.moveTo(150, 0);
    context.lineTo(150, 300);
    context.strokeStyle = "#000000";
    context.stroke();
    context.closePath();

    window.addEventListener("load", function () {
      createPlot(magnitudeGraph);
      Plotly.relayout(magnitudeGraph, { title: "Magnitude" });
      createPlot(phaseGraph);
      Plotly.relayout(phaseGraph, { title: "Phase" });
      createPlot(inputSignalGraph);
      Plotly.relayout(inputSignalGraph, { title: "Input Signal" });
      createPlot(outputSignalGraph);
      Plotly.relayout(outputSignalGraph, { title: "Output Signal" });
    });

    function createPlot(graphElement) {
      let layout = {
        margin: { l: 55, r: 50, t: 50, b: 40 },
        xaxis: {
          title: "Time (sec)",
          zoom: 1000,
        },
        yaxis: {
          title: "Amplitude",
        },
        showlegend: false,
      };
      Plotly.newPlot(graphElement,[], layout, {
        displaylogo: false,
        // Enable responsive sizing of the plot
        responsive: true,
        // Enable automatic resizing of the plot to fit its container element
        autosize: true,
      });
    }

    function plotSignal(data, graphElement) {
      //if first channel set the minTick=0 and maxTick=4 that is going to change to view plot as if realtime
        let plottingPointIndex = 0;
        let minTick = 0;
        let maxTick = 4;
      //set plottingPointIndex=0 to increment to go through all the points in signal
      let plottingInterval;
      let time;
      Plotly.relayout(graphElement, {
        "xaxis.fixedrange": false,
        dragmode: "pan",
      });
      //function that plots point by point and change the time interval accordingly to plot dynamically
      function actualPlotting() {
          if (plottingPointIndex < data.x.length) {
            Plotly.extendTraces(
              graphElement,
              {
                x: [[data.x[plottingPointIndex]]],
                y: [[data.y[plottingPointIndex]]],
              },
              [0]
            );
            plottingPointIndex++;
            //if condition used to change the time interval dynamically
            if (data.x[plottingPointIndex] > maxTick) {
              minTick = maxTick;
              maxTick += 4;
              Plotly.relayout(graphElement, {
                "xaxis.range": [minTick, maxTick],
                "xaxis.tickmode": "linear",
                "xaxis.dtick": 1,
              });
            }
          } else {
            clearInterval(plottingInterval);
          }
      }
      //function that starts plotting asynchronously
      function startInterval() {
        if (plottingInterval) {
          clearInterval(plottingInterval);
        }
        plottingInterval = setInterval(actualPlotting, time);
      }
      //start plotting
      startInterval();

      //eventlistener for cine speed sliders
      graphSpeed.addEventListener("change", () => {
        time = parseInt(graphSpeed.value);
        document.getElementById("rangevalue").innerHTML = `${graphSpeed.value}%`;
        //restart plottingInterval in order to apply speed changes
        startInterval();
      });
      
    }

    function convertCsvToTrace(csvdata) {
      // Extract data from the CSV data
      let x = csvdata.map((arrRow) => arrRow.col1);
      let y = csvdata.map((arrRow) => arrRow.col2);
      let uploadedSignal = {x: x, y: y };
      // If there are no existing signals, add the uploaded signal as a trace to the plot else add the uploaded signal as a component to the plot
      Plotly.addTraces(inputSignalGraph, { x: [], y: [] });
      plotSignal(uploadedSignal, inputSignalGraph);
    }

    // event listener to the file upload input element to trigger when a file is selected
uploadSignal.addEventListener("change", (event) => {
  // Set the isUploaded flag to true when a file is selected
  isUploaded = true;
  // Retrieve the file object from the event target
  const file = event.target.files[0];
  // Create a new file reader instance
  const reader = new FileReader();
  // Read the file as text
  reader.readAsText(file);
  let data;
  // Trigger this function when the file is loaded
  reader.onload = () => {
    // Parse the CSV data into an array of objects
    data = reader.result
      .trim()
      .split("\n")
      .map((row) => {
        // Split each row by comma and convert the values to numbers
        const [col1, col2] = row.split(",");
        return { col1: parseFloat(col1), col2: parseFloat(col2) };
      });
    // Convert the CSV data to a trace and update the graph
    convertCsvToTrace(data);
  };
});

const deleteButton = document.getElementById("delete");
const addZeroButton = document.getElementById("zero");
const addPoleButton = document.getElementById("pole");
const conjugateButton = document.getElementById("conjugate");
const clearAllButton = document.getElementById("clearall");

unitCircleCanvas.addEventListener("click", (event) => {
    const rect = unitCircleCanvas.getBoundingClientRect();
    //client is distance from start of viewport till point clicked in the div
    //rect is the distance from the viewport till the start of the div
    //the difference between them is the distance from the start of div till point clicked
    const x = event.clientX - rect.left;
    console.log("x", x, "clientx", event.clientX, "rectleft", rect.left);
    const y = event.clientY - rect.top;
    console.log("y", x, "clienty", event.clientY, "recttop", rect.top);
  if (addZeroButton.checked) {
      if (conjugateButton.checked) {
        createZero(x, y);
        createZero(x, 300 - y);
      } else {
        createZero(x, y);
      }
  } else if (addPoleButton.checked) {
      if (conjugateButton.checked) {
        createPole(x, y);
        createPole(x, 300 - y);
      } else {
        createPole(x, y);
      }
  }
});

function createZero(x, y) {
  const zero = document.createElement("div");
  zero.className = "zero";
  zero.style.left = x-5 + "px";
  zero.style.top = y-5 + "px";
  canvasContainer.appendChild(zero);
  zeros.push(zero);
//   dragElement(zero);
}

function createPole(x, y) {
  const pole = document.createElement("div");
  pole.className = "pole";
  pole.style.left = x - 5 + "px";
  pole.style.top = y - 5 + "px";
  canvasContainer.appendChild(pole);
  poles.push(pole);
//   dragElement(pole);
}

// function dragElement(element) {
//   let pos1 = 0,
//     pos2 = 0,
//     pos3 = 0,
//     pos4 = 0;

//   element.onmousedown = dragMouseDown;

//   function dragMouseDown(e) {
//     e = e || window.event;
//     e.preventDefault();
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     document.onmouseup = closeDragElement;
//     document.onmousemove = elementDrag;
//   }

//   function elementDrag(e) {
//     e = e || window.event;
//     e.preventDefault();
//     pos1 = pos3 - e.clientX;
//     pos2 = pos4 - e.clientY;
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     element.style.top = element.offsetTop - pos2 + "px";
//     element.style.left = element.offsetLeft - pos1 + "px";
//   }

//   function closeDragElement() {
//     document.onmouseup = null;
//     document.onmousemove = null;
//   }
// }

// function deleteZero(zero) {
//   zeroContainer.removeChild(zero);
//   zeros = zeros.filter((item) => item !== zero);
// }

// function deletePole(pole) {
//   zeroContainer.removeChild(pole);
//   poles = poles.filter((item) => item !== pole);
// }

// function clearZeros() {
//   zeros.forEach((zero) => zeroContainer.removeChild(zero));
//   zeros = [];
// }

// function clearPoles() {
//   poles.forEach((pole) => zeroContainer.removeChild(pole));
//   poles = [];
// }

// function clearAll() {
//   clearZeros();
//   clearPoles();
// }

// clearZerosButton.addEventListener("click", clearZeros);
// clearPolesButton.addEventListener("click", clearPoles);
// clearAllButton.addEventListener("click", clearAll);

// unitCircleCanvas.addEventListener("click", (e) => {
//   const rect = unitCircleCanvas.getBoundingClientRect();
//   const x = e.clientX - rect.left;
//   const y = e.clientY - rect.top;
//   if (conjugateCheckbox.checked) {
//     createZero(x, y);
//     createZero(x, 300 - y);
//   } else {
//     createZero(x, y);
//   }
// });

// zeroContainer.addEventListener("click", (e) => {
//   if (e.target.classList.contains("zero")) {
//     deleteZero(e.target);
//   } else if (e.target.classList.contains("pole")) {
//     deletePole(e.target);
//   }
// });