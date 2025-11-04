export async function enviarMensaje(texto: string) {
  const response = await fetch("/mensaje", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  return await response.json();
}

export async function obtenerConfirmaciones() {
  const response = await fetch("/confirmaciones", {
    method: "GET",
  });
  return await response.json();
}