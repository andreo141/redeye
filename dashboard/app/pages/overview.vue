<template>
  <main>
    <UContainer class="overview-container">
      <UCard
        id="overview-last-motion-card"
        class="overview-card"
        variant="soft"
      >
        <h1>Last Motion</h1>
        <div class="overview-card-value">{{ lastMotion }}</div>
      </UCard>
      <UCard
        id="overview-alerts-today-card"
        class="overview-card"
        variant="soft"
      >
        <h1>Alerts Today</h1>
        <div class="overview-card-value">{{ alertsToday }}</div>
      </UCard>
      <UCard
        id="overview-recent-alerts-card"
        class="overview-card"
        variant="soft"
      >
        <h1>Recent Alerts</h1>
        <br />
        <div v-if="alerts.length === 0">No alerts yet</div>
        <div v-else class="recent-alerts-list">
          <div
            v-for="alert in alerts.slice(0, 3)"
            :key="alert.id"
            class="recent-alert-item"
          >
            <div>
              {{ formatSensorName(alert.sensor) }} at
              {{ alert.location }}
            </div>
            <div class="recent-alert-time">
              {{
                new Date(alert.created_at + 'Z').toLocaleString('en-GB', {
                  timeZone: 'Europe/Brussels',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
type Alert = {
  id: number
  sensor: string
  location: string
  photo_url?: string | null
  created_at: string
}

const { formatSensorName } = useSensor()

const alerts = ref<Alert[]>([])
const now = ref(Date.now())

const { data } = await useFetch('/api/alerts')
alerts.value = data.value ?? []

const lastMotion = computed(() => {
  if (alerts.value.length === 0) return 'No motion detected'

  const lastSensorAlert = alerts.value[0]
  if (!lastSensorAlert?.created_at) return 'Invalid alert data'

  const lastAlertDate = new Date(lastSensorAlert.created_at + 'Z')

  const diff = now.value - lastAlertDate.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return `Just now at ${lastSensorAlert.location}`
  if (minutes < 60) return `${minutes} min ago at ${lastSensorAlert.location}`
  if (hours < 24) return `${hours}h ago at ${lastSensorAlert.location}`

  return (
    lastAlertDate.toLocaleString('en-GB', {
      timeZone: 'Europe/Brussels',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }) + ` at ${lastSensorAlert.location}`
  )
})

const todayString = computed(() => {
  return new Date(now.value).toLocaleDateString('en-GB', {
    timeZone: 'Europe/Brussels',
  })
})

const alertsToday = computed(() => {
  return alerts.value.filter((alert) => {
    const alertDate = new Date(alert.created_at + 'Z')

    return (
      alertDate.toLocaleDateString('en-GB', {
        timeZone: 'Europe/Brussels',
      }) === todayString.value
    )
  }).length
})

const fetchAlerts = async () => {
  alerts.value = await $fetch('/api/alerts')
}

let interval: ReturnType<typeof setInterval>
let clock: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(fetchAlerts, 30_000)
  clock = setInterval(() => {
    now.value = Date.now()
  }, 30_000)
})

onUnmounted(() => {
  clearInterval(interval)
  clearInterval(clock)
})
</script>

<style scoped>
.overview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.overview-card {
  background: #0f0f0f;
}

.overview-card-value {
  font-size: 24px;
  font-weight: 300;
  color: #f0f0f0;
  font-family: 'DM Mono', monospace;
  letter-spacing: -0.02em;
}

#overview-last-motion-card,
#overview-alerts-today-card {
  grid-column: span 1;
}

#overview-recent-alerts-card {
  grid-column: span 2;
}

.recent-alert-item {
  padding-bottom: 3rem;
}

@media (max-width: 768px) {
  .overview-container {
    grid-template-columns: 1fr;
  }

  #overview-recent-alerts-card {
    grid-column: span 1;
  }
}
</style>
