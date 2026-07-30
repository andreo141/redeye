<template>
  <main>
    <UCalendar
      v-model="value"
      range
      :number-of-months="3"
      :year-controls="false"
      variant="subtle"
    />
  </main>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const today = new Date()

const thisMonth = today.getUTCMonth() + 1
const thisDay = today.getUTCDate()
const thisYear = today.getUTCFullYear()

const value = shallowRef({
  start: new CalendarDate(thisYear, thisMonth, thisDay),
  end: new CalendarDate(thisYear, thisMonth, thisDay),
})
</script>
