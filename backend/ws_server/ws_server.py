# ws_server.py -- main file for the WebSocket server

from fastapi import FastAPI
from fastapi.websockets import WebSocket

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}