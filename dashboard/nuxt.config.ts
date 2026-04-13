export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  $development: {
    routeRules: {
      "/api/**": { proxy: `${process.env.API_PROXY_TARGET}/api/**` },
    },
  },

  $production: {
    routeRules: {
      "/api/**": { proxy: `${process.env.API_PROXY_TARGET}/api/**` },
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
