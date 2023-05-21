const magnitudeGraph = document.getElementById("magnitude");
const phaseGraph = document.getElementById("phase");
const inputSignalGraph = document.getElementById("inputsignal");
const outputSignalGraph = document.getElementById("outputsignal");
const graphSpeed = document.getElementById("speed");
const uploadSignal = document.getElementById("uploadsignal");
let time = 50;
const Complex = require("complex.js");
const Fraction = require("fraction.js");

// Function to calculate the frequency response of a filter given its zeros and poles
function calculateFrequencyResponse(zeros, poles) {
  // Calculate the frequency response at each frequency
  const frequencies = [];
  const magnitudes = [];
  const phases = [];
  for (let i = 0; i < 1000; i++) {
    const frequency = i / 1000;

    // Calculate the numerator and denominator of the transfer function
    let numerator = new Complex(1, 0);
    let denominator = new Complex(1, 0);
    for (let j = 0; j < zeros.length; j++) {
      numerator = numerator.mul(
        new Complex(1, 0).sub(new Complex(zeros[j], 0).mul(frequency))
      );
    }
    for (let j = 0; j < poles.length; j++) {
      denominator = denominator.mul(
        new Complex(1, 0).sub(new Complex(poles[j], 0).mul(frequency))
      );
    }
    // Calculate the transfer function
    const transferFunction = numerator.div(denominator);
    
    // Calculate the magnitude and phase of the transfer function
    const magnitude = transferFunction.abs();
    const phase = transferFunction.arg();
    
    // Add the frequency, magnitude and phase to the respective arrays
    frequencies.push(frequency);
    magnitudes.push(magnitude);
    phases.push(phase);
  }
  return { frequencies, magnitudes, phases };
}

const unitCircleCanvas = document.getElementById("unitcirclecanva");
plotFilterResponse(zeros, poles, unitCircleCanvas);



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
  Plotly.newPlot(graphElement, [], layout, {
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
  let uploadedSignal = { x: x, y: y };
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


function plotFilterResponse(zeros, poles, unitCircleCanvas) {
  const { frequencies, magnitudes, phases } = calculateFrequencyResponse(zeros, poles);

  // Plot Magnitude
  const magnitudeTrace = {
    x: frequencies,
    y: magnitudes,
    mode: "lines",
  };
  Plotly.update(magnitudeGraph, { data: [magnitudeTrace] });

  // Plot Phase
  const phaseTrace = {
    x: frequencies,
    y: phases,
    mode: "lines",
  };
  Plotly.update(phaseGraph, { data: [phaseTrace] });

  // Plot zeros and poles on the unit circle
  const ctx = unitCircleCanvas.getContext("2d");
  ctx.clearRect(0, 0, unitCircleCanvas.width, unitCircleCanvas.height);
  ctx.beginPath();
  ctx.arc(unitCircleCanvas.width / 2, unitCircleCanvas.height / 2, unitCircleCanvas.width / 2 - 1, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "blue";
  zeros.forEach((zero) => {
    const x = zero.re * unitCircleCanvas.width / 2 + unitCircleCanvas.width / 2;
    const y = -zero.im * unitCircleCanvas.height / 2 + unitCircleCanvas.height / 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.fillStyle = "red";
  poles.forEach((pole) => {
    const x = pole.re * unitCircleCanvas.width / 2 + unitCircleCanvas.width / 2;
    const y = -pole.im * unitCircleCanvas.height / 2 + unitCircleCanvas.height / 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
}
