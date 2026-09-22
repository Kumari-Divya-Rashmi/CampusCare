import {
  defineConfig,
} from "vitest/config";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],

  test: {
    globals: true,

    environment:
      "jsdom",

    setupFiles: [
      "./src/test/setup.js",
    ],

    css: true,

    environmentOptions: {
      jsdom: {
        url:
          "http://localhost:5173",
      },
    },
  },
});