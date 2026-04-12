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

        <NuxtLink to="/calendar" class="nav-item" active-class="active">
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
          Calendar
        </NuxtLink>

        <NuxtLink to="/sensors" class="nav-item" active-class="active">
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="8" cy="5" r="2.5" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
          Sensors
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
          <div class="status-pill">
            <div class="status-dot" />
            2 sensors online
          </div>
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

const route = useRoute();

const titles: Record<string, string> = {
  "/overview": "Overview",
  "/alerts": "Alert history",
  "/calendar": "Calendar",
  "/sensors": "Sensors",
};

const title = computed(() => titles[route.path]);
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

.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d1a0d;
  border: 1px solid #1a2e1a;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 11px;
  color: #4a9e4a;
  font-family: "DM Mono", monospace;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #4a9e4a;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
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
