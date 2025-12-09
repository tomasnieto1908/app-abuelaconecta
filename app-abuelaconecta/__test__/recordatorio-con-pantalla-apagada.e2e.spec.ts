// tests/recordatorio.e2e.spec.ts
import { test, expect, request } from '@playwright/test';

const SERVER_URL = 'http://127.0.0.1:5000'; // tu servidor tiene que estar corriendo acá

test('should save a reminder', async ({ request }) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const reminder = {
    id: 'pw-test-1',
    text: 'Test reminder',
    hour,
    minute
  };

  // Guardar recordatorio
  const saveRes = await request.post(`${SERVER_URL}/save-reminder`, {
    data: reminder
  });
  expect(saveRes.ok()).toBeTruthy();

  // Verificar que se guardó
  const getRes = await request.get(`${SERVER_URL}/reminders`);
  expect(getRes.ok()).toBeTruthy();

  const reminders = await getRes.json();
  expect(reminders).toContainEqual(
    expect.objectContaining({
      id: 'pw-test-1',
      text: 'Test reminder',
      hour,
      minute
    })
  );
});

test('should delete a reminder', async ({ request }) => {
  const deleteRes = await request.post(`${SERVER_URL}/delete-reminder`, {
    data: { id: 'pw-test-1' }
  });
  expect(deleteRes.ok()).toBeTruthy();

  const getRes = await request.get(`${SERVER_URL}/reminders`);
  const reminders = await getRes.json();
  expect(reminders).not.toContainEqual(
    expect.objectContaining({ id: 'pw-test-1' })
  );
});
