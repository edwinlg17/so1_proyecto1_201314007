import time

from locust import HttpUser, task

class pruebaServidor(HttpUser):
    @task
    def on_start(self):
        self.client.get("/postKill")