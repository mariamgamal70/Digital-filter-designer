const magnitudeGraph = document.getElementById("magnitude");
const phaseGraph = document.getElementById("phase");
const inputSignalGraph = document.getElementById("inputsignal");
const outputSignalGraph = document.getElementById("outputsignal");
const graphSpeed = document.getElementById("speed");
const uploadSignal = document.getElementById("uploadsignal");
const allPassResponse = document.getElementById("All-Pass");
const OriginalPhaseGraph = document.getElementById("originalphase");

let time = 50;
let uploadedSignal = { x: [], y: [] };
let outputSignal = { x: [], y: [] };

var listItemArray = [];

let inputSignalInterval;
let outputSignalInterval;
let inputPlottingPointIndex = 0;
let outputPlottingPointIndex = 0;
let inputMinTick = 0;
let inputMaxTick = 0.3;
let outputMinTick = 0;
let outputMaxTick = 0.3;

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
  Plotly.relayout(allPassResponse, {
    title: "Current chosen allpass filter",
    "xaxis.title": "Frequency (Hz)",
    "yaxis.title": "Amplitude (dB)",
  });
  createPlot(OriginalPhaseGraph);
  Plotly.relayout(OriginalPhaseGraph, {
    title: "Original corrected phase",
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
    inputPlottingPointIndex = 0;
    inputMinTick = 0;
    inputMaxTick = 0.3;
    clearInterval(inputSignalInterval);
    Plotly.deleteTraces(inputSignalGraph, 0);
    Plotly.addTraces(inputSignalGraph, { x: [], y: [] });
    startInputInterval();
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
    Plotly.deleteTraces(outputSignalGraph, 0);
    Plotly.addTraces(outputSignalGraph, { x: [], y: [] });
    startOutputInterval();
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
  outputSignal = { x: x, y: y };
  // If there are no existing signals, add the uploaded signal as a trace to the plot else add the uploaded signal as a component to the plot
  Plotly.addTraces(inputSignalGraph, { x: [], y: [] });
  startInputInterval();
  applyFilter();
}

// event listener to the file upload input element to trigger when a file is selected
uploadSignal.addEventListener("change", (event) => {
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
  startOutputInterval();
}

function handleDropdownItemClick(event) {
  event.preventDefault();
  var selectedItemText = this.textContent;
  var customInputVisible =
    document.getElementById("customInputContainer").style.display === "block";

  if (selectedItemText !== "Customize") {
    var listItemValue;
    if (customInputVisible) {
      var customValue = document.getElementById("customInputContainer").value;
      if (isValidCustomValue(customValue)) {
        listItemValue = customValue;
        document.getElementById("customInputContainer").value = "";
        document.getElementById("customInputContainer").style.display = "none";
      } else {
        alert("Invalid custom value. Please enter a value in the form x+yj.");
        return;
      }
    } else {
      listItemValue = selectedItemText;
    }

    var listItem = document.createElement("li");
    listItem.textContent = listItemValue;
    listItem.className = "list-group-item"; // Add class to list item

    var selectedItemsList = document.getElementById("selectedItemsList");
    selectedItemsList.appendChild(listItem);

    // Push the list item value into the array
    listItemArray.push(listItemValue);
    // Show the card
    document.getElementById("selectedItemsCard").style.display = "block";
  }
  plotAllPassFilterResponse();
  applyAllPassFilter();
}

function handleCustomizeOptionClick(event) {
  event.preventDefault();
  document.getElementById("customInputContainer").style.display =
    document.getElementById("customInputContainer").style.display === "none"
      ? "block"
      : "none";
}
function handleAddButtonClick(event) {
  event.preventDefault();
  var customValue = document.getElementById("customInputContainer").value;
  if (isValidCustomValue(customValue)) {
    var listItemValue = customValue; // Get only the value from the input

    // Create the card element
    var card = document.createElement("div");
    card.classList.add("card");
    card.style.width = "18rem";

    // Create the list element
    var list = document.createElement("ul");
    list.classList.add("list-group", "list-group-flush");

    // Create the list item
    var listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = listItemValue;

    // Append the list item to the list
    list.appendChild(listItem);

    // Append the list to the card
    card.appendChild(list);

    // Append the card to the selected items list
    document.getElementById("selectedItemsList").appendChild(card);

    document.getElementById("customInputContainer").value = "";
    document.getElementById("customInputContainer").style.display = "none";

    // Push the list item value into the array
    listItemArray.push(listItemValue);
    // Show the card
    document.getElementById("selectedItemsCard").style.display = "block";
  } else {
    alert("Invalid custom value. Please enter a value in the form x+yj.");
  }
  plotAllPassFilterResponse();
  applyAllPassFilter();
}

function isValidCustomValue(value) {
  var pattern = /^[-+]?[\d]+(\.[\d]+)?[+-][\d]+(\.[\d]+)?[j]$/;
  return pattern.test(value);
}

function handleDeleteButtonClick() {
  var selectedItemsList = document.getElementById("selectedItemsList");
  var remainingItems = document.querySelectorAll("#selectedItemsList li");
  if (remainingItems.length === 0) {
    // Hide the card if there are no items
    document.getElementById("selectedItemsCard").style.display = "none";
  } else {
    // Remove the last card from the list
    var cardToRemove = selectedItemsList.lastElementChild;
    selectedItemsList.removeChild(cardToRemove);

    // Remove the corresponding item from the array
    listItemArray.pop();
    Plotly.deleteTraces(allPassResponse, 0);
    plotAllPassFilterResponse();
    applyAllPassFilter();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var dropdownItems = document.querySelectorAll(
    ".dropdown-menu a.dropdown-item"
  );
  dropdownItems.forEach(function (item) {
    item.addEventListener("click", handleDropdownItemClick);
  });

  var customizeOption = document.querySelector(".customize-option");
  customizeOption.addEventListener("click", handleCustomizeOptionClick);

  var addButton = document.querySelector(".add-button");
  addButton.addEventListener("click", handleAddButtonClick);

  var deleteButton = document.querySelector("#deleteButton");
  deleteButton.addEventListener("click", handleDeleteButtonClick);
});

document.getElementById("img1").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "1+0.1j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img2").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "-0.92-0.65j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img3").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "3+3j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img4").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "0.5-0.94j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img5").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "-0.1107-0.4235j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img6").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "0.9+0j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img7").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "-0.9+0j";
  document.getElementById("customInputContainer").style.display = "block";
});
document.getElementById("img8").addEventListener("click", function () {
  document.getElementById("customInputContainer").value = "1.25+0.75j";
  document.getElementById("customInputContainer").style.display = "block";
});
