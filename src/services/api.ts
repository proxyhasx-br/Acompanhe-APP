const API_URL = "http://localhost:3333";

export async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}