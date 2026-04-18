<template>
  <main>
    <UContainer class="alerts-container">
      <UCard
        id="overview-recent-alerts-card"
        class="overview-card"
        variant="soft"
      >
        <h1>Recent Alerts</h1>
        <br />
        <div v-if="alerts.length === 0">No alerts yet</div>
        <AlertItem v-for="alert in alerts" :key="alert.id" :alert="alert" />
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
const alerts = ref<Alert[]>([])

const { data } = await useFetch('/api/alerts')
alerts.value = data.value ?? []
</script>
