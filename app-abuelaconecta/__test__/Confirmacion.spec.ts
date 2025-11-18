import { client, escucharMensajes } from "../hooks/mqttClient";
import * as Notifications from "expo-notifications";

jest.setTimeout(10000); // Timeout extendido porque es conexión real

describe("Historia 1: Confirmación de mensaje real", () => {
  test("Debe reaccionar a un mensaje de confirmación real", (done) => {
    // Mockeamos la notificación para verificar que se llama
    const spyNotification = jest.spyOn(Notifications, "scheduleNotificationAsync");

    // Escuchamos los mensajes del client real
    escucharMensajes();

    // Publicamos un mensaje en el topic de confirmación
    const mensaje = "Mensaje de prueba real";
    client.publish("abuela/confirmacion", mensaje, (err) => {
      if (err) return done(err);
    });

    // Esperamos un pequeño delay para que llegue el mensaje
    setTimeout(() => {
      try {
        expect(spyNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              title: "✅ Confirmación Recibida",
              body: mensaje,
            }),
          })
        );
        done();
      } catch (error) {
        done(error);
      }
    }, 2000); // Espera 2 segundos
  });
});
