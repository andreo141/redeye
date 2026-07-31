<template>
  <main>
    <div class="calendar-container">
      <UCalendar
        v-model="value"
        range
        :number-of-months="3"
        :year-controls="false"
      />
      <div class="calendar-selected-range">
        <span v-if="value.start && value.end">
          <strong class="selected-dates-text">Selected dates:</strong>
          {{ value.start }} -
          {{ value.end }}
          <div class="selected-dates-buttongroup">
            <UButton size="sm">Confirm</UButton>
            <UButton size="sm" color="neutral" variant="outline"
              >Cancel</UButton
            >
          </div>
        </span>
        <span v-else>Select occupancy date above</span>
      </div>
    </div>
    <div class="calendar-table-container">
      <UTable :data="occupancies" class="flex-1" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue'

const value = shallowRef({
  start: undefined,
  end: undefined,
})

}

const occupancies = ref([])
</script>
