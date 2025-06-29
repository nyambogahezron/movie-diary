# Database Migration Guide: SQLite to PostgreSQL with Prisma + Drizzle

## Overview

This guide documents the complete migration process from SQLite to PostgreSQL using Prisma Accelerate with Drizzle ORM. This migration enables better scalability, performance, and cloud compatibility for your movie diary application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Overview](#migration-overview)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Configuration Changes](#configuration-changes)
5. [Schema Conversion](#schema-conversion)
6. [Testing & Verification](#testing--verification)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration, ensure you have:

- Node.js (v18+) or Bun runtime
- A PostgreSQL database (local or cloud)
- Prisma Accelerate account (optional but recommended for production)
- Basic understanding of SQL and TypeScript

## Migration Overview

### Before (SQLite)

```
SQLite Database (local file)
↓
Drizzle ORM with sqlite-core
↓
LibSQL Client
```

### After (PostgreSQL + Prisma)

```
PostgreSQL Database (Prisma Accelerate)
↓
Prisma Client + Drizzle ORM
↓
postgres-js driver
```

## Step-by-Step Migration Process

### 1. Install Required Dependencies

```bash
# Add Prisma and PostgreSQL support
bun add @prisma/client prisma postgres drizzle-orm

# Development dependencies (if not already installed)
bun add -d prisma drizzle-kit @types/pg
```

### 2. Initialize Prisma

```bash
# Initialize Prisma in your project
bunx prisma init

# This creates:
# - prisma/schema.prisma
# - Updates .env with DATABASE_URL
```

### 3. Update Environment Variables

Update your `.env` file with your PostgreSQL connection string:

```env
# For Prisma Accelerate (recommended)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# For regular PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/movie_diary"
```

### 4. Update Drizzle Configuration

Update `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
	schema: './db/schema.ts',
	out: './db/migrations',
	dialect: 'postgresql', // Changed from 'sqlite'
	dbCredentials: {
		url: process.env.DATABASE_URL || 'postgresql://localhost:5432/movie_diary',
	},
} satisfies Config;
```

### 5. Update Database Configuration

Replace `config/database.ts`:

```typescript
import { drizzle } from 'drizzle-orm/prisma/pg';
import { PrismaClient } from '@prisma/client';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Prisma Client with Accelerate
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL,
});

export const db = drizzle(prisma);

export { schema, prisma };
```

### 6. Convert Schema from SQLite to PostgreSQL

The most critical step is converting your schema. Here are the key changes:

#### Before (SQLite):

```typescript
import {
	text,
	integer,
	sqliteTable,
	uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		isEmailVerified: integer('is_email_verified', { mode: 'boolean' })
			.default(false)
			.notNull(),
		createdAt: text('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => {
		return [uniqueIndex('users_username_unique').on(table.username)];
	}
);
```

#### After (PostgreSQL):

```typescript
import {
	text,
	integer,
	pgTable,
	uniqueIndex,
	boolean,
	timestamp,
	serial,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		isEmailVerified: boolean('is_email_verified').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => {
		return [uniqueIndex('users_username_unique').on(table.username)];
	}
);
```

#### Key Schema Conversion Rules:

| SQLite                                          | PostgreSQL                 | Notes                         |
| ----------------------------------------------- | -------------------------- | ----------------------------- |
| `sqliteTable`                                   | `pgTable`                  | Table definition              |
| `integer().primaryKey({ autoIncrement: true })` | `serial().primaryKey()`    | Auto-incrementing primary key |
| `integer('col', { mode: 'boolean' })`           | `boolean('col')`           | Boolean fields                |
| `text().default(sql\`CURRENT_TIMESTAMP\`)`      | `timestamp().defaultNow()` | Timestamps                    |
| `text()`                                        | `text()`                   | Text fields (same)            |
| `integer()`                                     | `integer()`                | Integer fields (same)         |

### 7. Create Prisma Schema

Create a matching Prisma schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                         Int       @id @default(autoincrement())
  name                       String
  username                   String?   @unique
  email                      String?   @unique
  password                   String
  avatar                     String?
  role                       String    @default("user")
  isEmailVerified           Boolean   @default(false) @map("is_email_verified")
  emailVerificationToken    String?   @map("email_verification_token")
  passwordResetToken        String?   @map("password_reset_token")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @default(now()) @updatedAt @map("updated_at")

  // Relations
  movies         Movie[]
  watchlists     Watchlist[]
  favorites      Favorite[]

  @@map("users")
}

// Add other models following the same pattern...
```

### 8. Generate Prisma Client and Run Migrations

```bash
# Generate Prisma client
bunx prisma generate

# Create and apply initial migration
bunx prisma migrate dev --name init

# For production deployments
bunx prisma migrate deploy
```

### 9. Clean Up Old Files

```bash
# Remove old SQLite database and migrations
rm -rf db/database.sqlite3 db/migrations

# Remove old migration scripts (if any)
rm -f scripts/run-migrations.ts
```

### 10. Update Package.json Scripts

```json
{
	"scripts": {
		"dev": "nodemon index.ts",
		"build": "tsc",
		"migrations": "prisma migrate dev",
		"migrations:deploy": "prisma migrate deploy",
		"db:generate": "prisma generate",
		"db:studio": "prisma studio",
		"db:reset": "prisma migrate reset --force",
		"setup": "bun install && bun run db:generate && bun run migrations"
	}
}
```

## Configuration Changes

### Database Connection Patterns

#### For Prisma Accelerate:

```typescript
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL, // prisma+postgres://...
});
```

#### For Regular PostgreSQL:

```typescript
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL, // postgresql://...
});
```

### Environment Variables

```env
# Prisma Accelerate (recommended for production)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_key"

# Local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Railway/Heroku
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
```

## Schema Conversion

### Complete Schema Migration Example

Here's a complete example of migrating a table:

#### Before (SQLite):

```typescript
export const movies = sqliteTable('movies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	rating: integer('rating'),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
```

#### After (PostgreSQL):

```typescript
export const movies = pgTable('movies', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	rating: integer('rating'),
	isPublic: boolean('is_public').notNull().default(false),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Testing & Verification

### 1. Test Database Connection

Create a test file:

```typescript
// test-connection.ts
import { db, prisma } from './config/database';

async function testConnection() {
	try {
		console.log('Testing connection...');

		// Test Prisma
		const userCount = await prisma.user.count();
		console.log('✅ Prisma connected! Users:', userCount);

		// Test Drizzle
		const users = await db.select().from(schema.users).limit(1);
		console.log('✅ Drizzle connected!');
	} catch (error) {
		console.error('❌ Connection failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testConnection();
```

Run the test:

```bash
bunx tsx test-connection.ts
```

### 2. Verify Schema

```bash
# Open Prisma Studio to inspect your database
bunx prisma studio

# View generated migrations
cat prisma/migrations/*/migration.sql
```

### 3. Test CRUD Operations

```typescript
// Basic CRUD test
async function testCRUD() {
	// Create
	const user = await prisma.user.create({
		data: {
			name: 'Test User',
			email: 'test@example.com',
			password: 'hashed_password',
		},
	});

	// Read
	const users = await prisma.user.findMany();

	// Update
	await prisma.user.update({
		where: { id: user.id },
		data: { name: 'Updated Name' },
	});

	// Delete
	await prisma.user.delete({ where: { id: user.id } });

	console.log('✅ CRUD operations successful!');
}
```

## Usage Examples

### Using Prisma Client

```typescript
import { prisma } from './config/database';

// Find users with relations
const usersWithMovies = await prisma.user.findMany({
	include: {
		movies: true,
		watchlists: {
			include: {
				watchlistMovies: {
					include: {
						movie: true,
					},
				},
			},
		},
	},
});

// Complex queries
const popularMovies = await prisma.movie.findMany({
	where: {
		rating: { gte: 8 },
		isPublic: true,
	},
	orderBy: { createdAt: 'desc' },
	take: 10,
});
```

### Using Drizzle with Prisma

```typescript
import { db } from './config/database';
import { users, movies } from './db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Type-safe queries
const highRatedMovies = await db
	.select()
	.from(movies)
	.where(and(gte(movies.rating, 8), eq(movies.isPublic, true)))
	.limit(10);

// Joins
const usersWithMovieCount = await db
	.select({
		userName: users.name,
		movieCount: count(movies.id),
	})
	.from(users)
	.leftJoin(movies, eq(users.id, movies.userId))
	.groupBy(users.id);
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Timeouts

```
Error: ETIMEDOUT
```

**Solution:** Check your DATABASE_URL and ensure your database is accessible.

#### 2. Schema Validation Errors

```
Error: Invalid schema
```

**Solution:** Ensure your Prisma schema matches your Drizzle schema exactly.

#### 3. Migration Conflicts

```
Error: Migration conflict
```

**Solution:** Reset migrations and start fresh:

```bash
bunx prisma migrate reset --force
bunx prisma migrate dev --name init
```

#### 4. Import/Export Issues

```
Error: Cannot find module
```

**Solution:** Update your imports to use the new database configuration:

```typescript
// Old
import { db } from './config/database';

// New - ensure you're importing from the updated file
import { db, prisma } from './config/database';
```

### Performance Optimization

#### 1. Connection Pooling

```typescript
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL,
	log: ['query', 'error', 'warn'],
});
```

#### 2. Query Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
	select: {
		id: true,
		name: true,
		email: true,
	},
});

// Use pagination
const movies = await prisma.movie.findMany({
	skip: (page - 1) * limit,
	take: limit,
});
```

## Commands Reference

### Development Commands

```bash
# Start development server
bun run dev

# Generate Prisma client
bun run db:generate

# Create new migration
bun run migrations

# Open database studio
bun run db:studio

# Reset database
bun run db:reset
```

### Production Commands

```bash
# Deploy migrations
bun run migrations:deploy

# Generate client for production
bunx prisma generate

# Build application
bun run build
```

## Conclusion

This migration provides several benefits:

1. **Better Performance**: PostgreSQL offers superior performance for complex queries
2. **Scalability**: Built-in support for horizontal scaling
3. **Advanced Features**: JSON columns, full-text search, advanced indexing
4. **Cloud Compatibility**: Works seamlessly with cloud providers
5. **Prisma Accelerate**: Global caching and connection pooling

Your application now uses a modern, scalable database setup that can grow with your needs while maintaining type safety and excellent developer experience.

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)
