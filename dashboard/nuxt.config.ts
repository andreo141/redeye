const apiTarget = process.env.API_PROXY_TARGET ?? "http://backend:3001";

export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true, redirect: "/overview" },
    "/api/alerts/**": {
      proxy: `${apiTarget}/api/alerts/**`,
    },
    "/api/camera/**": {
      proxy: `${apiTarget}/api/camera/**`,
    },
    "/api/photos/**": {
      proxy: `${apiTarget}/api/photos/**`,
    },
    "/api/occupancies/**": {
      proxy: `${apiTarget}/api/occupancies/**`,
    },
    "/api/settings/**": {
      proxy: `${apiTarget}/api/settings/**`,
    },
    "/api/status/**": {
      proxy: `${apiTarget}/api/status/**`,
    },
    "/api/override/**": {
      proxy: `${apiTarget}/api/override/**`,
    },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: false,
    },
  },

  runtimeConfig: {
    public: {
      apiBase: "/api",
    },
  },
});

