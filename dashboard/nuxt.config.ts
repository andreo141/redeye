export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  $development: {
    routeRules: {
      "/api/**": { proxy: "http://192.168.0.148:3001/api/**" },
    },
  },

  $production: {
    routeRules: {
      "/api/**": { proxy: "http://backend:3001/api/**" },
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
