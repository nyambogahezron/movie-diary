"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@libsql/client");
const libsql_1 = require("drizzle-orm/libsql");
const migrator_1 = require("drizzle-orm/libsql/migrator");
const schema = __importStar(require("../db/schema"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
dotenv_1.default.config();
const migrationsFolder = path_1.default.join(__dirname, '../db/migrations');
const metaFolder = path_1.default.join(migrationsFolder, 'meta');
// Ensure migrations folder structure exists
if (!fs_1.default.existsSync(metaFolder)) {
    fs_1.default.mkdirSync(metaFolder, { recursive: true });
}
const journalPath = path_1.default.join(metaFolder, '_journal.json');
if (!fs_1.default.existsSync(journalPath)) {
    fs_1.default.writeFileSync(journalPath, JSON.stringify({
        version: '5',
        entries: [],
    }));
}
async function runDrizzleKit(command) {
    console.log(`Running drizzle-kit ${command}...`);
    try {
        const { stdout, stderr } = await execPromise(`bun drizzle-kit ${command}`);
        if (stderr)
            console.error(`drizzle-kit ${command} stderr:`, stderr);
        return stdout;
    }
    catch (e) {
        console.error(`Error running drizzle-kit ${command}:`, e.message);
        throw e;
    }
}
async function runMigrations() {
    try {
        // Step 1: Generate migrations based on current schema
        const generateOutput = await runDrizzleKit('generate');
        console.log('Migration generation completed:', generateOutput);
        // Step 2: Apply migrations to database
        const dbUrl = process.env.DATABASE_URL || 'file:./db/database.sqlite3';
        const client = (0, client_1.createClient)({ url: dbUrl });
        const db = (0, libsql_1.drizzle)(client, { schema });
        console.log('Applying migrations to database...');
        await (0, migrator_1.migrate)(db, { migrationsFolder });
        console.log('Migrations applied successfully!');
        client.close();
    }
    catch (error) {
        console.error('Migration process failed:', error);
        process.exit(1);
    }
}
runMigrations();
//# sourceMappingURL=run-migrations.js.map