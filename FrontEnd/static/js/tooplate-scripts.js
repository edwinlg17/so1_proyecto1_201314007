const width_threshold = 480;

let socket = new WebSocket("ws://192.168.49.129:8080/ws");
console.log("Attempting Connection...");

socket.onopen = () => {
     console.log("Conexion establecida");
     socket.send(JSON.stringify({ Email: "cliente", Username: "ClienteNode", Message: "Hola" }))
     //socket.send("hola desde el cliente")
};

socket.onmessage = event => {
     const msg = JSON.parse(event.data);

     //console.log(msg.Procesos);
     //var usuarios = msg.Usuarios.split("\n");

     //console.log(JSON.parse(msg.Procesos));

     var usoCpu = 100 - msg.CPU;
     var total = msg.RAM.Total;
     var libre = msg.RAM.Libre + msg.RAM.BufferCached;
     var usada = total - libre;

     configLine.data.datasets[0].data.shift();
     configLine.data.datasets[0].data.push(usoCpu);
     configLine.data.datasets[0].label = "RAM " + Math.round(usoCpu) + "%";

     lineChart.options = optionsLine;
     lineChart.update();

     configLine2.data.datasets[0].data.shift();
     configLine2.data.datasets[0].data.push(usada);
     configLine2.data.datasets[0].label = "RAM " + Math.round(usada * 100 / total) + "%";
     optionsLine2.scales.yAxes[0].scaleLabel.labelString = "Total " + total + "MB"

     lineChart2.options = optionsLine2;
     lineChart2.update();

     var textoAcordeon = "";

     for (ele of msg.Procesos) {
          textoAcordeon += ''
               + '<div class="accordion-item">'
               + '     <h2 class="accordion-header" id="headingThree">'
               + '          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"'
               + '               data-bs-target="#proceso' + ele.PID + '" aria-expanded="false"'
               + '               aria-controls="proceso' + ele.PID + '">'
               + '<table class="table-striped table-hover" style="width:100%">'
               + '    <thead>'
               + '        <tr>'
               + '            <th scope="col">PID</th>'
               + '            <th scope="col">NOMBRE</th>'
               + '            <th scope="col">USUARIO</th>'
               + '            <th scope="col">ESTADO</th>'
               + '            <th scope="col">%RAM</th>'
               + '        </tr>'
               + '    </thead>'
               + '    <tbody>'
               + '        <tr>'
               + '            <th scope="row">' + ele.PID + '</th>'
               + '            <td>' + ele.Nombre + '</td>'
               + '            <td>' + ele.Usuario + '</td>'
               + '            <td>' + ele.Estado + '</td>'
               + '            <td>' + ele.RAM + '</td>'
               + '        </tr>'
               + '    </tbody>'
               + '</table>'
               + '          </button>'
               + '     </h2>'
               + '     <div id="proceso' + ele.PID + '" class="accordion-collapse collapse"'
               + '          aria-labelledby="headingThree" data-bs-parent="#accordionExample">'
               + '          <div class="accordion-body">';

          for (ele2 of ele.SubProcesos) {
               textoAcordeon += ''
                    + '<table class="table-striped table-hover" style="width:100%">'
                    + '    <thead>'
                    + '        <tr>'
                    + '            <th scope="col">PID</th>'
                    + '            <th scope="col">NOMBRE</th>'
                    + '            <th scope="col">USUARIO</th>'
                    + '            <th scope="col">ESTADO</th>'
                    + '            <th scope="col">%RAM</th>'
                    + '        </tr>'
                    + '    </thead>'
                    + '    <tbody>'
                    + '        <tr>'
                    + '            <th scope="row">' + ele2.PID + '</th>'
                    + '            <td>' + ele2.Nombre + '</td>'
                    + '            <td>' + ele2.Usuario + '</td>'
                    + '            <td>' + ele2.Estado + '</td>'
                    + '            <td>' + ele2.RAM + '</td>'
                    + '        </tr>'
                    + '    </tbody>'
                    + '</table>';
          }

          textoAcordeon += ''
               + '          </div>'
               + '     </div>'
               + '</div>\n';
     }

     /*
     
     
     
     
     
     */




     var acordeon = document.getElementById("acordeonProcesos");
     acordeon.innerHTML = "";
     acordeon.innerHTML = textoAcordeon;

     /*
     
     + '                       <th scope="row">' + ele.PID + '</th>\n'
     + '                       <td>' + ele.Nombre + '</td>\n'
     + '                       <td>' + ele.Usuario + '</td>\n'
     + '                       <td>' + ele.Estado + '</td>\n'
     + '                       <td>' + ele.RAM + '</td>\n'
     
     */

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
                                   max: 100
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
                         "0",
                         "1",
                         "2",
                         "3",
                         "4",
                         "5",
                         "6",
                         "7",
                         "8",
                         "9",
                         "10",
                         "11",
                         "12",
                         "13",
                         "14",
                         "15",
                         "16",
                         "17",
                         "18",
                         "19",
                         "20"
                    ],
                    datasets: [
                         {
                              label: "CPU",
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
                         "0",
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
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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


