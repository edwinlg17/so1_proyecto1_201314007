package main

// Librerias
import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"fmt"
	"os/exec"
	"strings"
	"time"

	"encoding/json"

	"github.com/gorilla/websocket"
)

///////////////////////// DECLARACIONES
// VARIABLES
var upgrader = websocket.Upgrader{}

var bufferString = ""
var bufferInfoProceso []infoProceso

// STRUCT
type tarea struct {
	PID string `json:"PID"`
}

type infoProceso struct {
	Nombre      string        `json:"Nombre"`
	PID         int           `json:"PID"`
	Estado      string        `json:"Estado"`
	RAM         int           `json:"RAM"`
	UID         int           `json:"UID"`
	Usuario     string        `json:"Usuario"`
	SubProcesos []infoProceso `json:"SubProcesos"`
}

type infoResumen struct {
	Running int `json:"Running"`
	Sleep   int `json:"Sleep"`
	Zombie  int `json:"Zombie"`
	Stoped  int `json:"Stoped"`
}

type infoRam struct {
	Total        int `json:"Total"`
	Libre        int `json:"Libre"`
	Compartida   int `json:"Compartida"`
	Buffer       int `json:"Buffer"`
	BufferCached int `json:"BufferCached"`
}

type informacion struct {
	RAM      infoRam       `json:"RAM"`
	CPU      float64       `json:"CPU"`
	Procesos []infoProceso `json:"Procesos"`
	Resumen  infoResumen   `json:"Resumen"`
}

///////////////////////// METODOS
// Metodo encargado de enviar la informacion
func envio(conn *websocket.Conn) {
	for {
		time.Sleep(time.Duration(500) * time.Millisecond)
		msg := informacion{}

		// obtengo la informacion de la ram
		msg.RAM = obtenerInformacionRam()

		// obtengo la informacion de la cpu
		msg.CPU = obtenerInformacionCPU()

		// obtengo la informacion de los proceso
		msg.Procesos, msg.Resumen = obtenerInformacionProcesos()

		// envio por el socket la informacion
		if err := conn.WriteJSON(msg); err != nil {
			log.Println(err)
			defer conn.Close()
			return
		}
	}
}

func obtenerInformacionProcesos() ([]infoProceso, infoResumen) {
	// leo la informacion del modulo
	s := ejecutarComando("cat /proc/cpu_201314007")

	if s != bufferString {
		bufferString = s

		// convierto la cadena en json
		msg := []infoProceso{}
		json.Unmarshal([]byte(s), &msg)

		msg = msg[1:]

		usuario := ""
		resumen := infoResumen{}
		for ind, ele := range msg {
			msg[ind].SubProcesos = ele.SubProcesos[1:]

			if msg[ind].Estado == "0" {
				msg[ind].Estado = "running"
				resumen.Running++
			} else if msg[ind].Estado == "1" {
				msg[ind].Estado = "sleep"
				resumen.Sleep++
			} else if msg[ind].Estado == "2" {
				msg[ind].Estado = "sleep"
				resumen.Sleep++
			} else if msg[ind].Estado == "4" {
				msg[ind].Estado = "zombie"
				resumen.Zombie++
			} else if msg[ind].Estado == "8" {
				msg[ind].Estado = "stoped"
				resumen.Stoped++
			} else if msg[ind].Estado == "1026" {
				msg[ind].Estado = "sleep"
				resumen.Sleep++
			}

			usuario = ejecutarComando("getent passwd " + strconv.Itoa(ele.UID) + " | cut -d: -f1")
			msg[ind].Usuario = strings.Replace(usuario, "\n", "", -1)

			for ind2, ele2 := range msg[ind].SubProcesos {
				usuario = ejecutarComando("getent passwd " + strconv.Itoa(ele2.UID) + " | cut -d: -f1")
				msg[ind].SubProcesos[ind2].Usuario = strings.Replace(usuario, "\n", "", -1)

				if msg[ind].SubProcesos[ind2].Estado == "0" {
					msg[ind].SubProcesos[ind2].Estado = "running"
					resumen.Running++
				} else if msg[ind].SubProcesos[ind2].Estado == "1" {
					msg[ind].SubProcesos[ind2].Estado = "sleep"
					resumen.Sleep++
				} else if msg[ind].SubProcesos[ind2].Estado == "2" {
					msg[ind].SubProcesos[ind2].Estado = "sleep"
					resumen.Sleep++
				} else if msg[ind].SubProcesos[ind2].Estado == "4" {
					msg[ind].SubProcesos[ind2].Estado = "zombie"
					resumen.Zombie++
				} else if msg[ind].SubProcesos[ind2].Estado == "8" {
					msg[ind].SubProcesos[ind2].Estado = "stoped"
					resumen.Stoped++
				} else if msg[ind].SubProcesos[ind2].Estado == "1026" {
					msg[ind].SubProcesos[ind2].Estado = "sleep"
					resumen.Sleep++
				}
			}
		}

		bufferInfoProceso = msg
		return msg, resumen
	} else {
		return bufferInfoProceso, infoResumen{}
	}
}

func obtenerInformacionCPU() float64 {
	if s, err := strconv.ParseFloat(ejecutarComando("top -bn 1 -i -c | head -n 3 | tail -1 | awk {'print $8'}"), 64); err == nil {
		return s
	}
	return 0
}

func obtenerInformacionRam() infoRam {
	// leo la informacion del modulo
	s := ejecutarComando("cat /proc/memo_201314007")

	// convierto la cadena en json
	msg := infoRam{}
	json.Unmarshal([]byte(s), &msg)

	// obtengo el valor de la memoria buffer/cached
	i, err := strconv.Atoi(ejecutarComando("free -m | head -n 2 | tail -1 | awk {'print $6'}"))
	if err != nil {
		fmt.Println(err)
		os.Exit(2)
	}
	msg.BufferCached = i

	return msg
}

// Metodo encargado de ejecutar comandos
func ejecutarComando(argumento2 string) string {
	// argumentos
	comando := "sh"
	argumento1 := "-c"

	// ejecuto el comando
	cmd := exec.Command(comando, argumento1, argumento2)

	// vericacion de error
	stdout, err := cmd.Output()
	if err != nil {
		fmt.Println(err.Error())
		return ""
	}

	//imprimo la salida
	return strings.Trim(string(stdout), "\n")
}

// Web Socket
func endPoint(w http.ResponseWriter, r *http.Request) {
	// cors
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// El método Upgrade() permite cambiar nuesra solicitud GET inicial a una completa en WebSocket,
	// si hay un error lo mostramos en consola pero no salimos.
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	// ejecuto la rutino
	go envio(ws)
}

func postKill(w http.ResponseWriter, r *http.Request) {
	(w).Header().Set("Access-Control-Allow-Origin", "*")
	(w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	mensaje := tarea{}
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(w, "id incorrecto")
	}
	json.Unmarshal(reqBody, &mensaje)

	if mensaje.PID != "" {
		ejecutarComando("echo '1711' | sudo -S kill " + mensaje.PID)
	}

	w.Header().Set("Content-Type", "application/json")
	respuesta := tarea{PID: "Aplicacion Cerrada"}
	json.NewEncoder(w).Encode(respuesta)
}

// Metodo Main
func main() {
	http.HandleFunc("/ws", endPoint)

	http.HandleFunc("/postKill", postKill)

	//router := mux.NewRouter().StrictSlash(true)
	//router.HandleFunc("/postKill", postKill).Methods("POST")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
