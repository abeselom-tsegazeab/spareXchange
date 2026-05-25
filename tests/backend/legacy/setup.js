import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

jest.mock("otplib", () => ({
	generateSecret: jest.fn(() => "test-secret"),
	generateURI: jest.fn(() => "otpauth://..."),
	verify: jest.fn(() => true),
	generate: jest.fn(() => "123456"),
	authenticator: {
		generate: jest.fn(() => "123456"),
		verify: jest.fn(() => true)
	}
}));

let mongoMemory;

beforeAll(async () => {
	console.log("--- Connecting to MongoDB for tests ---");
	if (mongoose.connection.readyState !== 0) return;

	const mongoUri = process.env.MONGO_URI;
	if (mongoUri) {
		let retries = 3;
		while (retries > 0) {
			try {
				await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
				console.log("--- Connected to MongoDB ---");
				return;
			} catch (err) {
				console.error(`--- MongoDB Connection Attempt Failed (${retries} retries left) ---`, err.message);
				retries -= 1;
				if (retries > 0) await new Promise(resolve => setTimeout(resolve, 2000));
			}
		}
	}

	// Fallback: spin up an ephemeral in-memory MongoDB for tests.
	console.log("--- Falling back to in-memory MongoDB for tests ---");
	mongoMemory = await MongoMemoryServer.create();
	await mongoose.connect(mongoMemory.getUri(), { serverSelectionTimeoutMS: 10000 });
	console.log("--- Connected to in-memory MongoDB ---");
});

afterAll(async () => {
	await mongoose.connection.close();

	if (mongoMemory) {
		await mongoMemory.stop();
		mongoMemory = undefined;
	}
});
