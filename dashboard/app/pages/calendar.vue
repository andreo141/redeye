<template>
  <main>
    <div class="calendar-container">
      <UCalendar
        v-model="selectedRange"
        range
        :number-of-months="3"
        :year-controls="false"
      />
      <div class="calendar-selected-range">
        <span v-if="selectedRange.start && selectedRange.end">
          <strong class="selected-dates-text">Selected dates:</strong>
          {{ selectedRange.start }} -
          {{ selectedRange.end }}
          <div class="selected-dates-buttongroup">
            <UInput
              v-model="occupantName"
              placeholder="Occupant name"
              size="sm"
            />

            <UButton size="sm" @click="confirmSelection">Confirm</UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              @click="cancelSelection"
              >Cancel</UButton
            >
          </div>
        </span>
        <span v-else>Select occupancy date above</span>
      </div>
    </div>
    <div class="calendar-table-container">
      <UTable :data="occupancies" :columns="columns" class="flex-1" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue'
import type { DateRange } from '@/types/dateRange'

const occupantName = ref('')

const { data: occupancies, refresh } = await useFetch('/api/occupancies')
const columns = [
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'occupant_name', header: 'Occupant' },
  { accessorKey: 'arrival_date', header: 'Arrival' },
  { accessorKey: 'departure_date', header: 'Departure' },
]

const selectedRange = shallowRef<DateRange>({
  start: undefined,
  end: undefined,
})

async function confirmSelection() {
  if (!occupantName.value?.trim()) return

  await $fetch('/api/occupancies', {
    method: 'POST',
    body: {
      location: 'Bergkot', // FIXME: Hardcoded location, should be dynamic
      occupantName: occupantName.value,
      arrivalDate: selectedRange.value.start?.toString(),
      departureDate: selectedRange.value.end?.toString(),
    },
  })

  await refresh()

  occupantName.value = ''
  selectedRange.value = { start: undefined, end: undefined }
}

function cancelSelection() {
  selectedRange.value = { start: undefined, end: undefined }
}
</script>
