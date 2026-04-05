let lastAlert = 0;
const COOLDOWN_MS = Number(process.env.CAMERA_TIMEOUT_MS) ?? 5000;

export default function isCoolingDown() {
  const now = Date.now();
  if (now - lastAlert < COOLDOWN_MS) return true;
  lastAlert = now;
  return false;
}
