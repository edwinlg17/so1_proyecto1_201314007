package main

// Librerias
import (
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

// STRUCT
type infoRam struct {
	Total        int `json:"Total"`
	Libre        int `json:"Libre"`
	Compartida   int `json:"Compartida"`
	Buffer       int `json:"Buffer"`
	BufferCached int `json:"BufferCached"`
}

type informacion struct {
	RAM      infoRam `json:"RAM"`
	CPU      float64 `json:"CPU"`
	Procesos string  `json:"Procesos"`
}

///////////////////////// METODOS
// Metodo encargado de enviar la informacion
func envio(conn *websocket.Conn) {
	for {
		msg := informacion{}

		// obtengo la informacion de la ram
		msg.RAM = obtenerInformacionRam()

		msg.CPU = obtenerInformacionCPU()

		// envio por el socket la informacion
		if err := conn.WriteJSON(msg); err != nil {
			log.Println(err)
			defer conn.Close()
			return
		}
		time.Sleep(time.Duration(1) * time.Second)
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
	s := ejecutarComando("cat /proc/moduloRAM")

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

// Metodo Main
func main() {
	http.HandleFunc("/ws", endPoint)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
