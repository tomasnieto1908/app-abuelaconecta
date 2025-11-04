// archivo: abuelaConecta.test.ts

// Mock global de fetch genérico
global.fetch = jest.fn((url: string, options?: any) => {
  const method = options?.method ?? "GET";

  const rutas: Record<string, any> = {
    "/mensaje": (opts: any) => {
      const body = JSON.parse(opts.body);
      return { status: "enviado (mock)", texto: body.texto };
    },
    "/confirmaciones": () => [
      { confirmado: true, id: 1 },
      { confirmado: false, id: 2 },
    ],
  };

  const respuesta = rutas[url]?.(options) ?? {};
  return Promise.resolve({
    json: () => Promise.resolve(respuesta),
  });
}) as jest.Mock;

// Funciones que usarán el mock
async function enviarMensaje(texto: string) {
  const response = await fetch("/mensaje", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  return response.json();
}

async function obtenerConfirmaciones() {
  const response = await fetch("/confirmaciones", {
    method: "GET",
  });
  return response.json();
}

// Tests
describe("API de AbuelaConecta - Mocks integrados", () => {

  test("Enviar mensaje", async () => {
    const respuesta = await enviarMensaje("Hola abuela!");
    expect(respuesta.status).toBe("enviado (mock)");
    expect(respuesta.texto).toBe("Hola abuela!");
  });

  test("Obtener confirmaciones", async () => {
    const confirmaciones = await obtenerConfirmaciones();
    expect(confirmaciones).toHaveLength(2);
    expect(confirmaciones[0]).toHaveProperty("confirmado");
    expect(confirmaciones[1].confirmado).toBe(false);
  });

});
