import dotenv from "dotenv";

dotenv.config();

const parsePositiveInteger = (
  value,
  fallback
) => {
  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    Number.isNaN(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
};

const rawOrigins =
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173";

export const env = {
  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  port:
    parsePositiveInteger(
      process.env.PORT,
      5000
    ),

  mongoUri:
    process.env.MONGO_URI,

  jwtSecret:
    process.env.JWT_SECRET,

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ||
    "7d",

  cloudinaryCloudName:
    process.env
      .CLOUDINARY_CLOUD_NAME,

  cloudinaryApiKey:
    process.env
      .CLOUDINARY_API_KEY,

  cloudinaryApiSecret:
    process.env
      .CLOUDINARY_API_SECRET,

  allowedOrigins:
    rawOrigins
      .split(",")
      .map(
        (origin) =>
          origin.trim()
      )
      .filter(Boolean),

  rateLimitWindowMs:
    parsePositiveInteger(
      process.env
        .RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000
    ),

  rateLimitMax:
    parsePositiveInteger(
      process.env
        .RATE_LIMIT_MAX,
      300
    ),

  authRateLimitMax:
    parsePositiveInteger(
      process.env
        .AUTH_RATE_LIMIT_MAX,
      20
    ),
};

export const validateEnvironment =
  () => {
    const requiredValues = [
      [
        "MONGO_URI",
        env.mongoUri,
      ],

      [
        "JWT_SECRET",
        env.jwtSecret,
      ],

      [
        "CLOUDINARY_CLOUD_NAME",
        env.cloudinaryCloudName,
      ],

      [
        "CLOUDINARY_API_KEY",
        env.cloudinaryApiKey,
      ],

      [
        "CLOUDINARY_API_SECRET",
        env.cloudinaryApiSecret,
      ],
    ];

    const missing =
      requiredValues
        .filter(
          ([, value]) =>
            !value
        )
        .map(
          ([name]) =>
            name
        );

    if (
      missing.length > 0
    ) {
      throw new Error(
        `Missing required environment variables: ${missing.join(
          ", "
        )}`
      );
    }

    if (
      env.nodeEnv ===
        "production" &&
      env.jwtSecret.length <
        32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters in production"
      );
    }

    if (
      env.allowedOrigins
        .length === 0
    ) {
      throw new Error(
        "At least one CORS origin is required"
      );
    }
  };