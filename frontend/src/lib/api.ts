const API_URL = "http://localhost:3000";

export async function getEvents() {
  const res = await fetch(`${API_URL}/events`);
  return res.json();
}

export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`);
  return res.json();
}

export async function getInventoryItem(id: string) {
  const res = await fetch(`${API_URL}/inventory/${id}`);
  return res.json();
}
