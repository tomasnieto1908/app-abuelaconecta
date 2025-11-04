// mocks/fetchMock.js
export const fetchMock = jest.fn((url, options) => {
  if (url === "/mensaje") {
    const body = JSON.parse(options.body);
    return Promise.resolve({
      json: async () => ({
        status: "enviado (mock)",
        texto: body.texto,
      }),
    });
  }
  
  if (url === "/confirmaciones") {
    return Promise.resolve({
      json: async () => [
        { confirmado: true, id: 1 },
        { confirmado: false, id: 2 },
      ],
    });
  }
  
  return Promise.resolve({ json: async () => ({}) });
});

