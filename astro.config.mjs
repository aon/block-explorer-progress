// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), tailwind()],

  env: {
    schema: {
      DOCKER_CONTAINER_NAME: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});