const width_threshold = 480;

let socket = new WebSocket("ws://192.168.49.129:8080/ws");
console.log("Attempting Connection...");

socket.onopen = () => {
     console.log("Conexion establecida");
     socket.send(JSON.stringify({ Email: "cliente", Username: "ClienteNode", Message: "Hola" }))
     //socket.send("hola desde el cliente")
};

var activadorArbol = true;
var activadorLista = true;

socket.onmessage = event => {
     const msg = JSON.parse(event.data);

     var usoCpu = 100 - msg.CPU;
     var total = msg.RAM.Total;
     var libre = msg.RAM.Libre + msg.RAM.BufferCached;
     var usada = total - libre;
     var usoRam = Math.round(usada * 100 / total);

     configLine.data.datasets[0].data.shift();
     configLine.data.datasets[0].data.push(usoCpu);
     configLine.data.datasets[0].label = "CPU " + Math.round(usoCpu) + "%";

     lineChart.options = optionsLine;
     lineChart.update();

     configLine2.data.datasets[0].data.shift();
     configLine2.data.datasets[0].data.push(usoRam);
     configLine2.data.datasets[0].label = "RAM " + usada + "MB " + usoRam + "%";
     optionsLine2.scales.yAxes[0].scaleLabel.labelString = "Total " + total + "MB";

     lineChart2.options = optionsLine2;
     lineChart2.update();

     var totalProcesos = msg.Resumen.Running + msg.Resumen.Sleep + msg.Resumen.Stoped + msg.Resumen.Zombie;

     var textoResumen = '<h2 class="tm-block-title">Tabla Resumen</h2>'
          + '<table class="table table-dark table-hover table-striped" style="width:100%">'
          + '    <tbody>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Informacion</th>'
          + '            <th style="width:150px" scope="row">Valor</th>'
          + '        </tr>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Procesos en ejecución:</th>'
          + '            <td style="width:150px">' + msg.Resumen.Running + '</td>'
          + '        </tr>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Procesos suspendidos:</th>'
          + '            <td style="width:150px">' + msg.Resumen.Sleep + '</td>'
          + '        </tr>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Procesos detenidos:</th>'
          + '            <td style="width:150px">' + msg.Resumen.Stoped + '</td>'
          + '        </tr>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Procesos zombie:</th>'
          + '            <td style="width:150px">' + msg.Resumen.Zombie + '</td>'
          + '        </tr>'
          + '        <tr>'
          + '            <th style="width:150px" scope="row">Total de procesos:</th>'
          + '            <td style="width:150px">' + totalProcesos + '</td>'
          + '        </tr>'
          + '    </tbody>'
          + '</table>';

     var resumen = document.getElementById("tablaResumen");
     resumen.innerHTML = "";
     resumen.innerHTML = textoResumen;

     if (activadorArbol || activadorLista) {
          var textoAcordeon = "";
          var textoTabla = "";
          textoTabla += '<table class="table table-dark table-hover table-striped" style="width:100%">'
               + '    <thead>'
               + '        <tr>'
               + '            <th scope="col">PID</th>'
               + '            <th scope="col">NOMBRE</th>'
               + '            <th scope="col">USUARIO</th>'
               + '            <th scope="col">ESTADO</th>'
               + '            <th scope="col">RAM</th>'
               + '            <th scope="col">Kill</th>'
               + '        </tr>'
               + '    </thead>'
               + '    <tbody>';

          for (ele of msg.Procesos) {
               textoAcordeon += ''
                    + '<div class="accordion-item">'
                    + '     <h2 class="accordion-header" id="headingThree">'
                    + '          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"'
                    + '               data-bs-target="#proceso' + ele.PID + '" aria-expanded="false"'
                    + '               aria-controls="proceso' + ele.PID + '">'
                    + '<table style="width:100%">'
                    + '    <thead>'
                    + '        <tr>'
                    + '            <th scope="col">PID</th>'
                    + '            <th scope="col">NOMBRE</th>'
                    + '            <th scope="col">USUARIO</th>'
                    + '            <th scope="col">ESTADO</th>'
                    + '            <th scope="col">RAM</th>'
                    + '        </tr>'
                    + '    </thead>'
                    + '    <tbody>'
                    + '        <tr>'
                    + '            <th scope="row" style="width:15px">' + ele.PID + '</th>'
                    + '            <td style="width:150px">' + ele.Nombre + '</td>'
                    + '            <td style="width:150px">' + ele.Usuario + '</td>'
                    + '            <td style="width:150px">' + ele.Estado + '</td>'
                    + '            <td style="width:150px">' + Math.round(ele.RAM / 1024 / 1024) + '</td>'
                    + '        </tr>'
                    + '    </tbody>'
                    + '</table>'
                    + '          </button>'
                    + '     </h2>'
                    + '     <div id="proceso' + ele.PID + '" class="accordion-collapse collapse"'
                    + '          aria-labelledby="headingThree" data-bs-parent="#accordionExample">'
                    + '          <div class="accordion-body">'
                    + '<table style="width:100%">'
                    + '    <thead>'
                    + '        <tr>'
                    + '            <th scope="col">PID</th>'
                    + '            <th scope="col">NOMBRE</th>'
                    + '        </tr>'
                    + '    </thead>'
                    + '    <tbody>';

               textoTabla += ""
                    + '        <tr>'
                    + '            <th scope="row" style="width:15px">' + ele.PID + '</th>'
                    + '            <td style="width:150px">' + ele.Nombre + '</td>'
                    + '            <td style="width:150px">' + ele.Usuario + '</td>'
                    + '            <td style="width:150px">' + ele.Estado + '</td>'
                    + '            <td style="width:150px">' + Math.round(ele.RAM / 1024 / 1024) + '</td>'
                    + '            <td style="width:150px"><button type="button" id="' + ele.PID + '" class="btn btn-outline-danger" onclick="killApp(this)">Kill</button></td>'
                    + '        </tr>';

               for (ele2 of ele.SubProcesos) {
                    textoAcordeon += ''
                         + '        <tr>'
                         + '            <th style="width:150px" scope="row">' + ele2.PID + '</th>'
                         + '            <td style="width:150px">' + ele2.Nombre + '</td>'
                         + '        </tr>';

                    textoTabla += ''
                         + '        <tr>'
                         + '            <th style="width:150px" scope="row">' + ele2.PID + '</th>'
                         + '            <td style="width:150px">' + ele2.Nombre + '</td>'
                         + '            <td style="width:150px">' + ele2.Usuario + '</td>'
                         + '            <td style="width:150px">' + ele2.Estado + '</td>'
                         + '            <td style="width:150px">' + Math.round(ele2.RAM / 1024 / 1024) + '</td>'
                         + '            <td style="width:150px"><button type="button" id="' + ele2.PID + '" class="btn btn-outline-danger" onclick="killApp(this)">Kill</button></td>'
                         + '        </tr>';
               }

               textoAcordeon += ''
                    + '    </tbody>'
                    + '</table>'
                    + '          </div>'
                    + '     </div>'
                    + '</div>\n';
          }

          textoTabla += ''
               + '    </tbody>'
               + '</table>';
     }

     if (activadorArbol) {
          var acordeon = document.getElementById("acordeonProcesos");
          acordeon.innerHTML = "";
          acordeon.innerHTML = textoAcordeon;
     }

     if (activadorLista) {
          var tabla = document.getElementById("listaProcesos");
          tabla.innerHTML = "";
          tabla.innerHTML = textoTabla;
     }
}

function verificarArbol(componente) {
     activadorArbol = componente.checked;
}

function verificarLista(componente) {
     activadorLista = componente.checked;
}

function killApp(com) {
     //alert(com.id);
     const url = "http://localhost:8080/postKill";
     const data = { PID: com.id };

     const othePram = {
          headers: {
               'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
          method: "POST"
     };

     fetch(url, othePram)
          .then(data => { return data.json() })
          .then(res => { alert(res.PID) })
          .catch(error => console.log(error))
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
                                   max: 100
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


