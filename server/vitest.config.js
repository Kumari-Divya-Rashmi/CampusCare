import {
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    environment:
      "node",

    setupFiles: [
      "./tests/setup.js",
    ],

    fileParallelism:
      false,

    testTimeout:
      60000,

    hookTimeout:
      120000,

    env: {
      NODE_ENV:
        "test",

      MONGO_URI:
        "mongodb://127.0.0.1:27017/campuscare-test-placeholder",

      JWT_SECRET:
        "campuscare_test_secret_key_with_more_than_32_characters",

      JWT_EXPIRES_IN:
        "1h",

      CORS_ORIGINS:
        "http://localhost:5173",

      CLIENT_URL:
        "http://localhost:5173",

      CLOUDINARY_CLOUD_NAME:
        "test-cloud",

      CLOUDINARY_API_KEY:
        "test-key",

      CLOUDINARY_API_SECRET:
        "test-secret",

      RATE_LIMIT_WINDOW_MS:
        "900000",

      RATE_LIMIT_MAX:
        "1000",

      AUTH_RATE_LIMIT_MAX:
        "1000",
    },
  },
});