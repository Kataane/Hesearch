import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
  ssr: false,
  buildModules: ["@pinia/nuxt"],
  modules: ["@inkline/nuxt"],
  inkline: {
    colorMode: "light",
  },
  components: {
    global: true,
    dirs: ["~/components"],
  },
});
