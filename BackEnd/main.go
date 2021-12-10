package main

// Librerias
import (
	"log"
	"net/http"

	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

type Mensaje struct {
	Valor1 string `json:"valor1"`
	Valor2 string `json:"valor2"`
	Valor3 string `json:"valor3"`
}

func envio(conn *websocket.Conn) {
	msg := Mensaje{
		Valor1: "Esta",
		Valor2: "es una",
		Valor3: "prueba",
	}

	for {
		if err := conn.WriteJSON(msg); err != nil {
			log.Println(err)
			defer conn.Close()
			return
		}
		time.Sleep(time.Duration(1) * time.Second)
	}

}

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

func main() {
	http.HandleFunc("/ws", endPoint)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
