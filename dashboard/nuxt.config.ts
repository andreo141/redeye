export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true, redirect: "/overview" },
  },

  $development: {
    routeRules: {
      "/api/alerts/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/alerts/**`,
      },
      "/api/camera/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/camera/**`,
      },
      "/api/photos/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/photos/**`,
      },
      "/api/occupancies/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/occupancies/**`,
      },
      "/api/settings/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/settings/**`,
      },
      "/api/status/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/status/**`,
      },
    },
  },

  $production: {
    routeRules: {
      "/api/alerts/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/alerts/**`,
      },
      "/api/camera/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/camera/**`,
      },
      "/api/photos/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/photos/**`,
      },
      "/api/occupancies/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/occupancies/**`,
      },
      "/api/settings/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/settings/**`,
      },
      "/api/status/**": {
        proxy: `${process.env.API_PROXY_TARGET}/api/status/**`,
      },
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
