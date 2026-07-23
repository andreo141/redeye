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
    <div>
      <img
        v-if="alert.photo_url"
        :src="`/api/photos/${alert.photo_url}`"
        alt="Alert photo"
        class="alert-photo"
      />
      <div v-else class="alert-no-photo">No photo</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Alert } from "~/types/alert";

defineProps<{ alert: Alert }>();

const { formatSensorName } = useSensor();
</script>

<style scoped>
.alert-photo {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 8px;
}
.alert-no-photo {
  color: #666;
  font-style: italic;
}
</style>
