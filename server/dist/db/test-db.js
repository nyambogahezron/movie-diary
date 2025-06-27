"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.resetTestDatabase = exports.db = exports.createTestClient = void 0;
const libsql_1 = require("drizzle-orm/libsql");
const client_1 = require("@libsql/client");
const createTestClient = () => {
    return (0, client_1.createClient)({
        url: 'file::memory:',
    });
};
exports.createTestClient = createTestClient;
let client = (0, exports.createTestClient)();
exports.client = client;
exports.db = (0, libsql_1.drizzle)(client);
const resetTestDatabase = async () => {
    if (client) {
        try {
            await client.close();
        }
        catch (error) {
            console.error('Error closing test database connection:', error);
        }
    }
    exports.client = client = (0, exports.createTestClient)();
    const newDb = (0, libsql_1.drizzle)(client);
    Object.assign(exports.db, newDb);
    return { db: exports.db, client };
};
exports.resetTestDatabase = resetTestDatabase;
//# sourceMappingURL=test-db.js.map