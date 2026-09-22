import {
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";

import mongoose from "mongoose";

import {
  MongoMemoryServer,
} from "mongodb-memory-server";

let mongoServer;

beforeAll(
  async () => {
    mongoServer =
      await MongoMemoryServer.create();

    const mongoUri =
      mongoServer.getUri();

    await mongoose.connect(
      mongoUri
    );
  }
);

afterEach(
  async () => {
    const collections =
      mongoose.connection
        .collections;

    const collectionNames =
      Object.keys(
        collections
      );

    for (
      const collectionName of
      collectionNames
    ) {
      await collections[
        collectionName
      ].deleteMany({});
    }
  }
);

afterAll(
  async () => {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  }
);