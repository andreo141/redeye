export type Override = {
  id: number;
  location: string;
  state: "armed" | "disarmed";
  set_at: string;
  expires_at: string | null;
};
