const magnitudeGraph = document.getElementById("magnitude");
const phaseGraph = document.getElementById("phase");
const inputSignalGraph = document.getElementById("inputsignal");
const outputSignalGraph = document.getElementById("outputsignal");
const graphSpeed = document.getElementById("speed");
const uploadSignal = document.getElementById("uploadsignal");
const allPassResponse = document.getElementById("All-Pass");
const OriginalPhaseGraph= document.getElementById("originalphase");


let time = 50;
let uploadedSignal = { x: [], y: [] };
let outputSignal = { x: [], y: [] };

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

let inputSignalInterval;
let outputSignalInterval;

// function plotSignal(data, graphElement) {
  //if first channel set the minTick=0 and maxTick=4 that is going to change to view plot as if realtime
  let inputPlottingPointIndex = 0;
  let outputPlottingPointIndex = 0;
  let inputMinTick = 0;
  let inputMaxTick = 0.3;
  let outputMinTick = 0;
  let outputMaxTick = 0.3;
  //set plottingPointIndex=0 to increment to go through all the points in signal
  // let plottingInterval;
  // let time;
  // Plotly.relayout(graphElement, {
  //   "xaxis.fixedrange": false,
  //   dragmode: "pan",
  // });
  //function that plots point by point and change the time interval accordingly to plot dynamically
  function inputPlotting() {
    if (inputPlottingPointIndex < uploadedSignal.x.length) {
      Plotly.extendTraces(
        inputSignalGraph,
        {
          x: [[uploadedSignal.x[inputPlottingPointIndex]]],
          y: [[uploadedSignal.y[inputPlottingPointIndex]]],
        },
        [0]
      );
      inputPlottingPointIndex++;
      //if condition used to change the time interval dynamically
      if (uploadedSignal.x[inputPlottingPointIndex] > inputMaxTick) {
        inputMinTick = inputMaxTick;
        inputMaxTick += 4;
        Plotly.relayout(inputSignalGraph, {
          "xaxis.range": [inputMinTick, inputMaxTick],
          "xaxis.tickmode": "linear",
          "xaxis.dtick": 1,
        });
      }
    } else {
      inputPlottingPointIndex=0;
      inputMinTick = 0;
      inputMaxTick = 0.3;
      clearInterval(inputSignalInterval);
    }
  }

  function outputPlotting() {
    if (outputPlottingPointIndex < outputSignal.x.length) {
      Plotly.extendTraces(
        outputSignalGraph,
        {
          x: [[outputSignal.x[outputPlottingPointIndex]]],
          y: [[outputSignal.y[outputPlottingPointIndex]]],
        },
        [0]
      );
      outputPlottingPointIndex++;
      //if condition used to change the time interval dynamically
      if (outputSignal.x[outputPlottingPointIndex] > outputMaxTick) {
        outputMinTick = outputMaxTick;
        outputMaxTick += 4;
        Plotly.relayout(outputSignalGraph, {
          "xaxis.range": [outputMinTick, outputMaxTick],
          "xaxis.tickmode": "linear",
          "xaxis.dtick": 1,
        });
      }
    } else {
        outputPlottingPointIndex = 0;
        outputMinTick = 0;
        outputMaxTick = 0.3;
        clearInterval(outputSignalInterval);
    }
  }

  //function that starts plotting asynchronously
  function startInputInterval() {
    if (inputSignalInterval) {
      clearInterval(inputSignalInterval);
    }
    inputSignalInterval = setInterval(inputPlotting, time);
  }

  function startOutputInterval() {
    if (outputSignalInterval) {
      clearInterval(outputSignalInterval);
    }
    outputSignalInterval = setInterval(outputPlotting, time);
  }

  //eventlistener for cine speed sliders
    graphSpeed.addEventListener("change", () => {
    time = parseInt(graphSpeed.value);
    document.getElementById("rangevalue").innerHTML = `${graphSpeed.value}%`;
    //restart plottingInterval in order to apply speed changes
    startInputInterval();
    startOutputInterval();
  });
// }

function convertCsvToTrace(csvdata) {
  // Extract data from the CSV data
  let x = csvdata.map((arrRow) => arrRow.col1);
  let y = csvdata.map((arrRow) => arrRow.col2);
  uploadedSignal = { x: x, y: y };
  // If there are no existing signals, add the uploaded signal as a trace to the plot else add the uploaded signal as a component to the plot
  Plotly.addTraces(inputSignalGraph, { x: [], y: [] });
  startInputInterval();
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

// function applyFilter() {
//   const formData = new FormData();
//   formData.append("amplitude", uploadedSignal.y);
//   fetch("/applyFilter", {
//     method: "POST",
//     body: formData,
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("filter failed");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       outputsignal = { x: uploadedSignal.x, y: data.filteredData };
//       if (outputSignalGraph.data.length==0){
//         Plotly.addTraces(outputSignalGraph, { x: [], y: [] });
//       }else{
//         Plotly.deleteTraces(outputSignalGraph, 0);
//         Plotly.addTraces(outputSignalGraph, outputsignal);
//       }
//       // plotSignal(outputsignal, outputSignalGraph);
//       startOutputInterval();
//       }
//     )
//     .catch((error) => {
//       // Handle errors, e.g. display an error message to the user
//       console.error("Error fetching frequency response:", error);
//     });
// }

async function applyFilter() {
    const formData = new FormData();
    formData.append("amplitude", uploadedSignal.y);

    const response = await fetch("/applyFilter", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Filter failed");
    }

    const data = await response.json();

    outputSignal = { x: uploadedSignal.x, y: data.filteredData };

    if (outputSignalGraph.data.length == 0) {
      Plotly.addTraces(outputSignalGraph, { x: [], y: [] });
    } 
    // else {
    //   const newData = outputSignal.y.slice(outputPlottingPointIndex); // Get the new data from the current index onwards
    //   Plotly.extendTraces(outputSignalGraph, { y: [newData] }, [0]); // Extend the existing trace with the new data
    // }
    
    startOutputInterval();
}
