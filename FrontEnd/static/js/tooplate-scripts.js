const width_threshold = 480;

let socket = new WebSocket("ws://192.168.49.129:8080/ws");
console.log("Attempting Connection...");

socket.onopen = () => {
     console.log("Conexion establecida");
     socket.send(JSON.stringify({ Email: "cliente", Username: "ClienteNode", Message: "Hola" }))
     //socket.send("hola desde el cliente")
};

socket.onmessage = event => {
     const msn = JSON.parse(event.data);

     var total = msn.Ram.Total;
     var libre = msn.Ram.Libre + msn.Ram.BufferCached;
     var usada = total - libre;

     configLine2.data.datasets[0].data.shift();
     configLine2.data.datasets[0].data.push(usada);
     configLine2.data.datasets[0].label = "RAM " + Math.round(usada * 100 / total, -1) + "%";
     optionsLine2.scales.yAxes[0].scaleLabel.labelString = "Total "+ total + "MB"

     lineChart2.options = optionsLine2;
     lineChart2.update();

     //console.log(msn);
}

socket.onclose = event => {
     console.log("Conexion desconectada: ", event);
     socket.send(JSON.stringify({ Email: "cliente", Username: "ClienteNode", Message: "Hola" }))
     //socket.send("Cliente Desconectado!")
};

socket.onerror = error => {
     console.log("Error Socket: ", error);
};

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
                              },
                              display: true,
                              ticks: {
                                   beginAtZero: true,
                                   steps: 10,
                                   stepValue: 5,
                                   max: 8000
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
                              label: "CPU",
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
                              },
                              display: true,
                              ticks: {
                                   beginAtZero: true,
                                   steps: 10,
                                   stepValue: 5,
                                   max: 8000
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
                              label: "RAM",
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                              borderColor: "rgb( 155, 19, 219 )",
                              fill: true,
                              backgroundColor: 'rgb( 155, 19, 219 , 0.2)',
                              tension: 0,
                              cubicInterpolationMode: "",
                              pointRadius: 5
                         }
                    ]
               },
               options: optionsLine2
          };

          lineChart2 = new Chart(ctxLine2, configLine2);
     }
}

/*function updateLineChart2() {
     if (lineChart) {
          lineChart2.options = optionsLine2;
          lineChart2.update();
     }
}*/


