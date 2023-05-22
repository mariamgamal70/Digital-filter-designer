const magnitudeGraph = document.getElementById("magnitude");
const phaseGraph = document.getElementById("phase");
const inputSignalGraph = document.getElementById("inputsignal");
const outputSignalGraph = document.getElementById("outputsignal");
const graphSpeed = document.getElementById("speed");
const uploadSignal = document.getElementById("uploadsignal");
const allPassResponse = document.getElementById("All-Pass");
const OriginalPhaseGraph= document.getElementById("originalphase");
// const OrignialPhase =  document.getElementById("originalphase");
let time = 50;
let uploadedSignal = {};

window.addEventListener("load", function () {
  createPlot(magnitudeGraph);
  Plotly.relayout(magnitudeGraph, {
    title: "Magnitude",
    "xaxis.title": "Frequency (Hz)",
    "yaxis.title": "Amplitude (dB)",
  });
  createPlot(phaseGraph);
  Plotly.relayout(phaseGraph, { 
    title: "Phase",
    "xaxis.title": "Frequency (Hz)",
    "yaxis.title": "Angle (radians)",
   });
  createPlot(inputSignalGraph);
  Plotly.relayout(inputSignalGraph, { title: "Input Signal" });
  createPlot(outputSignalGraph);
  Plotly.relayout(outputSignalGraph, { title: "Output Signal" });
  createPlot(allPassResponse);
  Plotly.relayout(allPassResponse, { title: "All-Pass response", 
    "xaxis.title": "Frequency (Hz)",
    "yaxis.title": "Amplitude (dB)",
  });
  createPlot(OriginalPhaseGraph);
  Plotly.relayout(OriginalPhaseGraph, { 
    title: "Orignial Phase",
    "xaxis.title": "Frequency (Hz)",
    "yaxis.title": "Angle (radians)",
   });
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
  uploadedSignal = { x: x, y: y };
  // If there are no existing signals, add the uploaded signal as a trace to the plot else add the uploaded signal as a component to the plot
  Plotly.addTraces(inputSignalGraph, { x: [], y: [] });
  plotSignal(uploadedSignal, inputSignalGraph);
  applyFilter(); 
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

function applyFilter() {
  const formData = new FormData();
  formData.append("amplitude", uploadedSignal.y);
  console.log(uploadedSignal.y);
  fetch("/applyFilter", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("filter failed");
      }
      return response.json();
    })
    .then((data) => {
      let outputsignal = { x: uploadedSignal.x, y: data.filteredData };
      if (outputSignalGraph.data.length==0){
        Plotly.addTraces(outputSignalGraph, { x: [], y: [] });
      }else{
        Plotly.deleteTraces(outputSignalGraph, 0);
        Plotly.addTraces(outputSignalGraph, outputsignal);
      }
      plotSignal(outputsignal, outputSignalGraph);
      }
    )
    .catch((error) => {
      // Handle errors, e.g. display an error message to the user
      console.error("Error fetching frequency response:", error);
    });
}
