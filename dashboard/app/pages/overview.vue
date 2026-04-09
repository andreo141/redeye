<template>
  <main>
    <h1>Latest Alerts</h1>
    <br />
    <div v-if="!alerts || alerts.length === 0">
      <p>No alerts yet.</p>
    </div>
    <ul v-else>
      <li v-for="alert in alerts" :key="alert.id">
        <div class="alert-item">
          <div class="alert-info">
            <div class="alert-topic">{{ alert.sensor }}</div>
            <div class="alert-topic">{{ alert.location }}</div>
            <div class="alert-timestamp">
              {{ alert.created_at }}
            </div>
          </div>
        </div>
        <br />
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const alerts = ref([])

const fetchAlerts = async () => {
  const { data } = await useFetch('http://backend:3001/api/alerts')
  alerts.value = data.value ?? []
}

await fetchAlerts()

onMounted(() => {
  const interval = setInterval(fetchAlerts, 30_000)
  onUnmounted(() => clearInterval(interval))
})
</script>
