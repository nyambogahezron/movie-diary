# Vercel Deployment Setup

This guide will help you deploy your Movie Diary server to Vercel using GitHub Actions.

## Prerequisites

1. A GitHub repository with your code
2. A Vercel account
3. The Vercel CLI installed locally (optional but recommended)

## Step 1: Set up Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Choose the server directory as your project root
5. Vercel will automatically detect it's a Node.js project

## Step 2: Get Vercel Credentials

You'll need three pieces of information for GitHub Actions:

### Get Vercel Token

1. Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

### Get Organization ID

1. Go to [Vercel Settings > General](https://vercel.com/account)
2. Copy your "Organization ID" (or "User ID" for personal accounts)

### Get Project ID

1. Go to your Vercel project dashboard
2. Go to Settings > General
3. Copy the "Project ID"

## Step 3: Add GitHub Secrets

In your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add these repository secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your organization/user ID
   - `VERCEL_PROJECT_ID`: Your project ID

## Step 4: Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to Settings > Environment Variables
2. Add all the environment variables from your `env-example.txt`:
   - `JWT_SECRET`
   - `CSRF_SECRET`
   - `DATABASE_URL`
   - `CLIENT_URL` (set this to your frontend URL)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (if using email)

## Step 5: Database Considerations

⚠️ **Important**: Vercel functions are stateless and don't support SQLite files. You'll need to:

1. **Option A**: Use a cloud database like:

   - [Turso](https://turso.tech/) (SQLite-compatible)
   - [PlanetScale](https://planetscale.com/) (MySQL)
   - [Supabase](https://supabase.com/) (PostgreSQL)

2. **Option B**: Use Vercel's KV storage or Postgres

3. **Option C**: Use a database service like Railway, Heroku Postgres, etc.

## Step 6: Update Your Code for Vercel

Your `vercel.json` is already configured. Make sure your Express app exports the app instance (which you already do).

## Step 7: Deploy

Once everything is set up:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to Vercel
3. You can also manually deploy using the Vercel CLI: `vercel --prod`

## Troubleshooting

### Common Issues:

1. **Database Connection**: Make sure your database is accessible from Vercel's servers
2. **Environment Variables**: Ensure all required env vars are set in Vercel
3. **CORS**: Update your `CLIENT_URL` to match your frontend domain
4. **Build Errors**: Check the build logs in both GitHub Actions and Vercel

### Checking Deployment Status:

- GitHub Actions: Go to your repo > Actions tab
- Vercel: Go to your project > Deployments tab

## Production Considerations

1. **Database**: Migrate from SQLite to a cloud database
2. **File Storage**: Consider using Vercel Blob or AWS S3 for file uploads
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **Scaling**: Vercel functions have execution time limits (30s max)
