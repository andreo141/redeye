<template>
  <div class="alert-item">
    <div>{{ formatSensorName(alert.sensor) }} at {{ alert.location }}</div>
    <div class="alert-time">
      {{
        new Date(alert.created_at + "Z").toLocaleString("en-GB", {
          timeZone: "Europe/Brussels",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
type Alert = {
  id: number;
  sensor: string;
  location: string;
  photo_url?: string | null;
  created_at: string;
};

defineProps<{ alert: Alert }>();

const { formatSensorName } = useSensor();
</script>
