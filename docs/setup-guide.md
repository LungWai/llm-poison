# Setup Guide - Critical Components

This guide addresses the critical missing components identified in the project assessment.

## 1. Environment Configuration (Critical)

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project dashboard at https://app.supabase.com/
# Navigate to Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Domain Configuration for Subdomain Support
# For local development, use localhost:3000
# For production, use your actual domain (e.g., yoursite.com)
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000

# Optional: Environment indicator
NODE_ENV=development
```

## 2. Database Setup (Critical)

### Step 1: Run SQL Migration
1. Navigate to your Supabase project dashboard
2. Go to SQL Editor
3. Copy and run the content from `supabase/migrations/001_initial_schema.sql`

This will create:
- `entries` table with proper columns and constraints
- `votes` table with unique constraints
- Row Level Security (RLS) policies
- Efficient functions for vote counting
- Proper indexes for performance

### Step 2: Enable Authentication
1. In Supabase Dashboard > Authentication > Providers
2. Enable Email provider
3. Optionally enable OAuth providers (Google, GitHub, etc.)
4. Configure email templates if needed

## 3. Local Development with Subdomains

### Option 1: Using hosts file (Recommended for testing)
Edit your system's hosts file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux:** `/etc/hosts`

Add entries like:
```
127.0.0.1  test-article.localhost
127.0.0.1  my-page.localhost
```

Then access: `http://test-article.localhost:3000`

### Option 2: Using actual domain (Production setup)
1. Configure DNS with wildcard subdomain (*.yourdomain.com)
2. Deploy to Vercel with custom domain
3. Add both `yourdomain.com` and `*.yourdomain.com` in Vercel domains
4. Update `NEXT_PUBLIC_ROOT_DOMAIN` to your actual domain

## 4. Deployment Checklist

### Vercel Configuration
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Configure custom domain
4. Add wildcard subdomain support

### Supabase Configuration
1. Set up production Supabase project
2. Run migration scripts
3. Configure authentication providers
4. Set up proper CORS origins

## 5. Testing the Setup

1. **Authentication Test:**
   - Visit `/login` and `/signup`
   - Test login/logout functionality
   - Verify dashboard access requires authentication

2. **Content Creation Test:**
   - Create a new entry in `/dashboard`
   - Toggle between draft and published status
   - Verify RLS policies work (users only see their content)

3. **Subdomain Test:**
   - Publish an entry with slug "test-page"
   - Access `test-page.yourdomain.com` (or with localhost setup)
   - Verify content renders correctly

4. **Voting Test:**
   - Test voting while logged in
   - Verify vote counts update correctly
   - Test that duplicate votes are prevented

## 6. Common Issues & Solutions

### Environment Variables Not Loading
- Restart your development server after adding `.env.local`
- Verify file is in project root
- Check for typos in variable names

### Subdomain Not Working Locally
- Verify hosts file entries
- Clear browser cache
- Try different browser or incognito mode

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check if RLS policies are blocking access
- Verify user authentication status

### Build Errors
- Run `npm install` to ensure all dependencies
- Check TypeScript errors with `npm run lint`
- Verify all environment variables are set

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific values for development vs production
- Regularly rotate Supabase keys if compromised
- Monitor Supabase logs for unusual activity 