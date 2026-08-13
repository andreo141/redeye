<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-dot" />
        <span class="logo-text"><NuxtLink to="/">RedEye</NuxtLink></span>
      </div>

      <nav class="nav">
        <span class="nav-label">Monitor</span>

        <NuxtLink to="/overview" class="nav-item" active-class="active">
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          Overview
        </NuxtLink>

        <NuxtLink to="/alerts" class="nav-item" active-class="active">
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 2" />
          </svg>
          Alert history
        </NuxtLink>

        <span class="nav-label" style="margin-top: 8px">Manage</span>

        <NuxtLink to="/occupancies" class="nav-item" active-class="active">
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="1" y="2" width="14" height="12" rx="1.5" />
            <path d="M5 2v12M1 6h14" />
          </svg>
          Occupancies
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user">
          <div class="avatar">A</div>
          <div class="user-info">
            <div class="user-name">Andreo</div>
            <div class="user-role">Admin</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <span class="page-title">{{ title }}</span>
        <div class="topbar-right">
          <USwitch
            unchecked-icon="i-lucide-shield-off"
            checked-icon="i-lucide-shield"
            color="success"
            :model-value="armed"
            @v-on:change="setOverride"
          />
          <div v-if="armed" class="status-pill-good">Armed</div>
          <div v-else class="status-pill-bad">Disarmed</div>
          <div v-if="cameraEnabled" class="status-pill-good">
            <div class="status-dot-good" />
            Camera online
          </div>
          <div v-else class="status-pill-bad">
            <div class="status-dot-bad" />
            Camera offline
          </div>
        </div>

        <div
          v-if="cameraEnabled && lastRssi !== null"
          class="rssi-info"
          :class="`rssi-${rssiStatus}`"
        >
          RSSI: {{ lastRssi }} dBm
          <span v-if="rssiStatus === 'weak'">: weak signal</span>
          <span v-if="rssiStatus === 'critical'">: very weak signal</span>
        </div>
        <div class="settings-menu">
          <USlideover
            v-model:open="isSettingsOpen"
            title="Settings"
            close-icon="i-lucide-arrow-right"
          >
            <UButton icon="lucide-settings-2" variant="ghost" color="neutral" />
            <template #body>
              <UForm
                :validate="validate"
                :state="settings"
                class="space-y-4"
                @submit="onSubmit"
              >
                <UFormField label="Sensor location name" name="location">
                  <UInput v-model="settings.location" />
                </UFormField>

                <UButton type="submit" variant="subtle"> Save </UButton>
              </UForm>
            </template>
          </USlideover>
        </div>
      </div>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { CameraStatus } from "~/types/cameraStatus";
import type { SystemStatus } from "~/types/status";
import type { Settings } from "~/types/settings";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const isSettingsOpen = ref(false);

const armed = computed(() => systemStatus.value?.armed ?? false);

const { data: currentSettings } = await useFetch<Settings>("/api/settings");
const settings = reactive<Settings>({ location: "" });
settings.location = currentSettings.value?.location ?? "";

const OVERRIDE_EXPIRATION_MINUTES = 60;

type Schema = typeof settings;

function validate(state: Partial<Schema>): FormError[] {
  const errors = [];
  if (!state.location) errors.push({ name: "location", message: "Required" });
  return errors;
}

const { data: activeOverride } = (await useFetch("/api/override")) ?? null;
console.log(activeOverride);

async function setOverride() {
  try {
    await $fetch("/api/override", {
      method: "POST",
      body: {
        state: !armed.value,
        set_at: String(Date.now()),
        expires_at: OVERRIDE_EXPIRATION_MINUTES,
      },
    });
  } catch (err) {
    const errorMsg = "Something went wrong when setting the override";
    toast.add({
      title: "Error",
      description: errorMsg,
      color: "error",
    });
    console.error(errorMsg, err);
    return;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch("/api/settings", {
      method: "POST",
      body: {
        location: event.data.location,
      },
    });
  } catch (err) {
    toast.add({
      title: "Error",
      description: "Something went wrong while saving your settings.",
      color: "error",
    });
    console.error("Something went wrong while saving your settings.", err);
    return;
  }
  toast.add({
    title: "Success",
    description: "Your settings have been updated.",
    color: "success",
  });
  isSettingsOpen.value = false;
}

const route = useRoute();
let statusInterval: ReturnType<typeof setInterval>;

const { data: cameraStatus, refresh: refreshCameraStatus } =
  await useFetch<CameraStatus>("/api/camera/status");

const cameraEnabled = computed(() => cameraStatus.value?.online ?? false);

const { data: systemStatus, refresh: refreshSystemStatus } =
  await useFetch<SystemStatus>("/api/status");

const lastRssi = computed(() => cameraStatus.value?.lastRssi ?? null);
const rssiStatus = computed(() => {
  const rssi = cameraStatus.value?.lastRssi;
  if (rssi === null || rssi === undefined) return "unknown";
  if (rssi >= -70) return "good";
  if (rssi >= -80) return "weak";
  return "critical";
});

const title = computed(() => titles[route.path]);

const titles: Record<string, string> = {
  "/overview": "Overview",
  "/alerts": "Alert history",
  "/occupancies": "Occupancies",
  "/sensors": "Sensors",
};

onMounted(() => {
  statusInterval = setInterval(() => {
    refreshCameraStatus();
    refreshSystemStatus();
  }, 10_000);
});

onUnmounted(() => clearInterval(statusInterval));
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap");

.shell {
  display: flex;
  height: 100vh;
  background: #0a0a0a;
  font-family: "DM Sans", sans-serif;
  color: #f0f0f0;
}

.sidebar {
  width: 220px;
  min-width: 220px;
  background: #0f0f0f;
  border-right: 1px solid #1f1f1f;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 24px 20px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #1a1a1a;
}

.logo-dot {
  width: 10px;
  height: 10px;
  background: #e53e3e;
  border-radius: 50%;
  box-shadow: 0 0 8px #e53e3e88;
  flex-shrink: 0;
}

.logo-text {
  font-size: 15px;
  font-weight: 500;
  color: #f0f0f0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav {
  padding: 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  color: #3a3a3a;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 8px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #5a5a5a;
  font-size: 13px;
  font-weight: 400;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-item:hover {
  background: #161616;
  color: #999;
}

.nav-item.active {
  background: #1a0a0a;
  color: #e53e3e;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #1a1a1a;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
}

.avatar {
  width: 28px;
  height: 28px;
  background: #1f1f1f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 12px;
  color: #888;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 10px;
  color: #3a3a3a;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 56px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  flex-shrink: 0;
}

.page-title {
  font-size: 13px;
  font-weight: 500;
  color: #f0f0f0;
  letter-spacing: 0.02em;
}

.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-pill-good {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: #4a9e4a;
  font-family: "DM Mono", monospace;
}

.status-dot-good {
  width: 6px;
  height: 6px;
  background: #4a9e4a;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-pill-bad {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: #9e4a4a;
  font-family: "DM Mono", monospace;
}

.status-dot-bad {
  width: 6px;
  height: 6px;
  background: #9e4a4a;
  border-radius: 50%;
}

.overview-card {
  background: #0f0f0f;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
