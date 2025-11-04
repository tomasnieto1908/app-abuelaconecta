from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import datetime



# =====================
# APP FastAPI
# =====================
app = FastAPI(title="AbuelaConecta Backend")

# =====================
# MODELOS
# =====================
class Mensaje(BaseModel):
    texto: str
    fecha: datetime.datetime

class Recordatorio(BaseModel):
    texto: str
    fecha: datetime.datetime

class Confirmacion(BaseModel):
    mensaje_id: int
    confirmado: bool

# =====================
# MOCK DB
# =====================
mensajes = []
recordatorios = []
confirmaciones = []

# =====================
# MOCK MQTT
# =====================
def mock_mqtt_publish(topic, mensaje):
    print(f"[MQTT MOCK] Publicando en {topic}: {mensaje}")

def mock_mqtt_subscribe(topic):
    print(f"[MQTT MOCK] Suscrito al topic: {topic}")

# Inicializamos suscripción simulada
mock_mqtt_subscribe("abuela/confirmacion")

# =====================
# ENDPOINTS
# =====================
@app.post("/mensaje")
def enviar_mensaje(mensaje: Mensaje):
    mensaje_id = len(mensajes) + 1
    mensajes.append({"id": mensaje_id, **mensaje.dict()})
    # Simulamos publicar en MQTT
    mock_mqtt_publish("abuela/mensaje", mensaje.texto)
    # Generamos confirmación mock automática (solo para pruebas)
    confirmaciones.append({"mensaje_id": mensaje_id, "confirmado": False})
    return {"id": mensaje_id, "status": "enviado (mock)"}

@app.post("/recordatorio")
def crear_recordatorio(recordatorio: Recordatorio):
    recordatorio_id = len(recordatorios) + 1
    recordatorios.append({"id": recordatorio_id, **recordatorio.dict()})
    return {"id": recordatorio_id, "status": "guardado (mock)"}

@app.get("/confirmaciones", response_model=List[Confirmacion])
def obtener_confirmaciones():
    return confirmaciones

@app.post("/confirmacion/{mensaje_id}")
def confirmar_mensaje(mensaje_id: int):
    # Simulamos que la Raspberry confirma el mensaje
    for c in confirmaciones:
        if c["mensaje_id"] == mensaje_id:
            c["confirmado"] = True
            mock_mqtt_publish("abuela/confirmacion", f"Mensaje {mensaje_id} confirmado")
            return {"mensaje_id": mensaje_id, "status": "confirmado (mock)"}
    return {"error": "mensaje no encontrado"}
