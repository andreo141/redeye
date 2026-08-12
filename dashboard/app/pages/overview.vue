<template>
  <main>
    <UContainer>
      <UCard
        id="overview-status-card"
        class="overview-card status-card"
        variant="soft"
      >
        <div
          class="status-card-value"
          :class="status?.armed ? 'status-armed' : 'status-disarmed'"
        >
          {{ statusText }}
        </div>
      </UCard>
    </UContainer>
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
        <AlertItem
          v-for="alert in alerts.slice(0, 5)"
          :key="alert.id"
          :alert="alert"
        />
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { SystemStatus } from '~/types/status'
import type { Alert } from '~/types/alert'

const alerts = ref<Alert[]>([])
const now = ref(Date.now())

const { data } = await useFetch<Alert[]>('/api/alerts')
alerts.value = data.value ?? []

const { data: status, refresh: refreshStatus } =
  await useFetch<SystemStatus>('/api/status')

const statusText = computed(() =>
  status.value ? formatStatus(status.value) : '',
)

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
  alerts.value = await $fetch<Alert[]>('/api/alerts')
}

let interval: ReturnType<typeof setInterval>
let clock: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    fetchAlerts()
    refreshStatus()
  }, 30_000)
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
.status-card {
  margin-bottom: 16px;
}

.status-card-value {
  font-size: 20px;
  font-weight: 400;
  font-family: 'DM Mono', monospace;
  letter-spacing: -0.02em;
}

.status-armed {
  color: #4a9e4a;
}

.status-disarmed {
  color: #9e4a4a;
}
</style>
