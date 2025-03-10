# Supabase Setup for Spark

This document provides instructions for setting up Supabase for the Spark application.

## Getting Started

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the API settings
4. Add these to your `.env.local` file (see `.env.example` for reference)

## Database Schema

The `schema.sql` file contains the SQL commands to set up the database schema for Spark. It includes:

- `profiles` table: Stores user profile information
- `social_links` table: Stores user's social media links
- `profile_themes` table: Stores theme settings for user profiles
- `profile_analytics` table: Tracks profile views and visitors
- `link_clicks` table: Tracks clicks on social links
- `custom_domains` table: Manages custom domains for profiles

## Setting Up the Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `schema.sql`
3. Paste into the SQL Editor and run the query

## Authentication Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following settings:

### Site URL
- Set the Site URL to your production URL (or http://localhost:3000 for development)

### Email Auth
- Enable Email auth
- Configure email templates for:
  - Confirmation
  - Invitation
  - Magic Link
  - Reset Password

### Redirect URLs
- Add your app's URLs to the allowed redirect URLs:
  - `http://localhost:3000/auth/callback` (for development)
  - `https://yourdomain.com/auth/callback` (for production)

## Row Level Security (RLS)

The schema includes Row Level Security policies to ensure users can only access their own data. These policies are automatically set up when you run the schema SQL.

## Triggers and Functions

The schema includes:

- A trigger to automatically update the `updated_at` column when records are modified
- A function to handle new user signups, which creates associated records in the `profiles`, `profile_themes`, and `profile_analytics` tables

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing the Setup

After setting up Supabase, you should be able to:

1. Register a new user
2. Sign in with the registered user
3. View and update the user's profile
4. (Coming soon) Add and manage social links

If you encounter any issues, check the Supabase logs in the dashboard for more information. 