"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestDatabase = setupTestDatabase;
exports.teardownTestDatabase = teardownTestDatabase;
const test_db_1 = require("../db/test-db");
const migrator_1 = require("drizzle-orm/libsql/migrator");
const drizzle_orm_1 = require("drizzle-orm");
// Setup function to run before all tests
async function setupTestDatabase() {
    try {
        // Reset the database connection to ensure it's fresh for each test suite
        const { db: freshDb } = await (0, test_db_1.resetTestDatabase)();
        // Enable foreign keys
        await freshDb.run((0, drizzle_orm_1.sql) `PRAGMA foreign_keys = ON;`);
        // Apply migrations
        await (0, migrator_1.migrate)(freshDb, { migrationsFolder: './db/migrations' });
        // You can add seed data here if needed
    }
    catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
}
// Teardown function to run after all tests - if needed
async function teardownTestDatabase() {
    // We handle this in resetTestDatabase now
}
//# sourceMappingURL=setup.js.map