const width_threshold = 480;

function dibujarMonitorCPU() {
  if ($("#lineChart").length) {
    ctxLine = document.getElementById("lineChart").getContext("2d");

    optionsLine = {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: ""
            }
          }
        ]
      }
    };

    // Set aspect ratio based on window width
    optionsLine.maintainAspectRatio =
      $(window).width() < width_threshold ? false : true;

    configLine = {
      type: "line",
      data: {
        labels: [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10"
        ],
        datasets: [
          {
            label: "Ram",
            data: [88, 68, 79, 57, 50, 55, 70, 99, 20, 100],
            borderColor: "rgb(243, 156, 18)",
            fill: true,
            backgroundColor: 'rgb(243, 156, 18, 0.2)',
            tension: 0,
            cubicInterpolationMode: "monotone",
            pointRadius: 5
          }
        ]
      },
      options: optionsLine
    };

    lineChart = new Chart(ctxLine, configLine);
  }
}

function dibujarMonitorRAM() {
  if ($("#lineChart").length) {
    ctxLine2 = document.getElementById("lineChart2").getContext("2d");

    optionsLine2 = {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: ""
            }
          }
        ]
      }
    };

    // Set aspect ratio based on window width
    optionsLine.maintainAspectRatio =
      $(window).width() < width_threshold ? false : true;

    configLine2 = {
      type: "line",
      data: {
        labels: [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10"
        ],
        datasets: [
          {
            label: "Ram",
            data: [88, 68, 79, 57, 50, 55, 70, 99, 20, 100],
            borderColor: "rgb(243, 156, 18)",
            fill: true,
            backgroundColor: 'rgb(243, 156, 18, 0.2)',
            tension: 0,
            cubicInterpolationMode: "monotone",
            pointRadius: 5
          }
        ]
      },
      options: optionsLine2
    };

    lineChart2 = new Chart(ctxLine2, configLine2);
  }
}

function updateLineChart() {
  if (lineChart) {
    lineChart.options = optionsLine;
    lineChart.update();
  }
}


