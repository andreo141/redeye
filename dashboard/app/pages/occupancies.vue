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
      <UTable :data="occupancies" :columns="columns" class="flex-1">
        <template #empty>
          <span>No occupancies scheduled</span>
        </template>
        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            class="delete-occupancy-button"
            @click="promptDeleteOccupancy(row.original.id)"
          />
        </template>
      </UTable>
    </div>
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <div class="delete-modal">
          <p>Delete this occupancy?</p>
          <div class="delete-modal-actions">
            <UButton
              color="neutral"
              variant="outline"
              @click="isDeleteModalOpen = false"
              >Cancel</UButton
            >
            <UButton color="error" @click="confirmDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue'
import type { DateRange } from '@/types/dateRange'

const occupantName = ref('')

const isDeleteModalOpen = ref(false)
const occupancyToDelete = ref<number | null>(null)

const { data: occupancies, refresh } = await useFetch('/api/occupancies')
const columns = [
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'occupant_name', header: 'Occupant' },
  { accessorKey: 'arrival_date', header: 'Arrival' },
  { accessorKey: 'departure_date', header: 'Departure' },
  { id: 'actions', header: '', size: 50, enableResizing: false },
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

function promptDeleteOccupancy(occupancyId: number) {
  occupancyToDelete.value = occupancyId
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (occupancyToDelete.value !== null) {
    await $fetch(`/api/occupancies/${occupancyToDelete.value}`, {
      method: 'DELETE',
    })
    occupancyToDelete.value = null
  }
  isDeleteModalOpen.value = false
  await refresh()
}
</script>

<style scoped>
:deep(.calendar-table-container td:last-child),
:deep(.calendar-table-container th:last-child) {
  width: 1%;
  white-space: nowrap;
}
</style>
