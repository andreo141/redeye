<template>
  <main>
    <UContainer class="alerts-container">
      <UCard
        id="overview-recent-alerts-card"
        class="overview-card"
        variant="soft"
      >
        <div v-if="alerts.length === 0">No alerts yet</div>
        <AlertItem v-for="alert in alerts" :key="alert.id" :alert="alert" />
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { Alert } from '@/types/alert'

const { data } = await useFetch<Alert[]>('/api/alerts')
const alerts = ref<Alert[]>(data.value ?? [])
</script>
