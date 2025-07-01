# CMS Platform - Supabase & Next.js

A sophisticated Content Management System with subdomain publishing and LLM benchmark capabilities. This platform allows authenticated users to create and manage HTML content, which is then published to the public on unique, dynamically generated subdomains.

## 🚀 Project Status: 85% Complete ✅

### ✅ Implemented Features
- **Authentication System**: Login, signup, and secure session management
- **Content Management**: Rich text editor with HTML sanitization
- **Database**: Complete schema with Row Level Security (RLS) policies
- **Voting System**: Like/unlike functionality for published content
- **Subdomain Support**: Dynamic content rendering on custom subdomains
- **Navigation**: Responsive header with authentication status
- **Error Handling**: Comprehensive error pages and user feedback

### 🔧 Setup Required
You need to configure your Supabase project credentials to get started.

## 📋 Quick Setup

### 1. Check Your Setup
```bash
npm run check-setup
```

### 2. Environment Configuration
Create `.env.local` in the project root:
```bash
# Supabase Configuration (get from https://app.supabase.com/)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Domain Configuration
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000  # For development
```

### 3. Database Setup
1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Copy and run the content from `supabase/migrations/001_initial_schema.sql`

### 4. Start Development
```bash
npm run dev
```

## 📚 Documentation

- **📖 [Setup Guide](docs/setup-guide.md)** - Comprehensive setup instructions
- **🗂️ [Product Guide](docs/product.md)** - Full project architecture and features
- **🗄️ [Database Schema](supabase/migrations/001_initial_schema.sql)** - SQL migration file

## 🧪 Testing Your Setup

1. **Authentication**: Visit `/login` and `/signup`
2. **Content Creation**: Create entries in `/dashboard`
3. **Voting**: Test like/unlike on published content
4. **Subdomains**: Configure DNS and test custom subdomains

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Editor**: TipTap rich text editor with HTML sanitization
- **Deployment**: Vercel with wildcard subdomain support

## 🔒 Security Features

- Row Level Security (RLS) policies
- HTML content sanitization (client and server-side)
- CSRF protection with server actions
- JWT-based authentication

## 🚀 Deployment

The application is ready for deployment to Vercel. See the [Setup Guide](docs/setup-guide.md) for production configuration instructions.

---

**Need Help?** Check the [Setup Guide](docs/setup-guide.md) or run `npm run check-setup` to diagnose issues.
