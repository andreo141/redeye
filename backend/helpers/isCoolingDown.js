let lastAlert = 0;
const COOLDOWN_MS = process.env.COOLDOWN_MS ?? 60000;

export default function isCoolingDown() {
  const now = Date.now();
  if (now - lastAlert < COOLDOWN_MS) return true;
  lastAlert = now;
  return false;
}
