export type CameraStatus = {
  online: boolean;
  url: string | null;
  lastHeartbeat: number | null;
  lastRssi: number | null;
};
