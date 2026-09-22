import {
  env,
} from "./env.js";

export const isOriginAllowed =
  (origin) => {
    if (!origin) {
      return true;
    }

    return env.allowedOrigins.includes(
      origin
    );
  };

export const corsOptions = {
  origin: (
    origin,
    callback
  ) => {
    if (
      isOriginAllowed(
        origin
      )
    ) {
      callback(
        null,
        true
      );

      return;
    }

    const error =
      new Error(
        "Not allowed by CORS"
      );

    error.statusCode =
      403;

    callback(error);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

export const socketCorsOptions =
  {
    origin:
      env.allowedOrigins,

    methods: [
      "GET",
      "POST",
      "PATCH",
    ],

    credentials: true,
  };