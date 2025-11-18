jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    publish: jest.fn((topic, msg, cb) => cb && cb(null)),
    subscribe: jest.fn((topics, cb) => cb && cb(null)),
    on: jest.fn(),
    end: jest.fn(),
    connected: true
  }))
}));

import mqtt from "mqtt";
import { enviarMensaje } from "../hooks/mqttClient";

describe("Historia 4: Programar un recordatorio", () => {

  test("Debe enviar un recordatorio y llamar a connect", () => {
    const contenido = "Tomar la medicación";
    const mensaje = JSON.stringify({ contenido });
    enviarMensaje(mensaje);
    // testea que connect fue llamada
    expect(mqtt.connect).toHaveBeenCalled()
  });

  test("Debe enviar un recordatorio y llamar a publish", () => {
    const contenido = "Tomar la medicación";
    const mensaje = JSON.stringify({ contenido });
    enviarMensaje(mensaje);
    const mockClient = (mqtt.connect as jest.Mock).mock.results[0].value;
    expect(mockClient.publish).toHaveBeenCalled();
  });

});
