# Trybe Setup Guide

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the root directory with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development
NODE_ENV=development
```

### 2. Database Setup
Run these SQL scripts in your Supabase SQL Editor in this order:

1. **enhanced-schema.sql** - Main database schema with all tables and RLS policies
2. **storage-setup.sql** - File storage buckets and policies

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Login
Navigate to `http://localhost:3000/auth/login` to test the authentication system.

## 📁 Project Structure

```
trybe/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── auth/           # Authentication pages
│   │   └── valley/         # Main application
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── navigation.tsx # Main navigation
│   │   ├── dashboard.tsx  # Dashboard view
│   │   ├── project-valley.tsx
│   │   ├── collective-pulse.tsx
│   │   └── tribes.tsx
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities and configurations
│   │   └── supabase/     # Supabase client and queries
│   └── types/           # TypeScript definitions
├── enhanced-schema.sql   # Database schema
├── storage-setup.sql    # Storage configuration
└── README.md           # Project documentation
```

## 🔐 Authentication Features

- **Email/Password**: Traditional login
- **Google OAuth**: Social login
- **Magic Links**: Passwordless authentication
- **Profile Management**: Automatic profile creation and management

## 🎯 Core Features

### Project Valley
- Organize creative projects with channels and blocks
- Visual project management with status tracking
- Portfolio-ready project development

### Collective Pulse
- Share progress updates with the community
- Showcase completed work
- Request collaborations
- Engage with likes, comments, and saves

### Tribes
- Join specialized creative communities
- Create and manage tribes
- Access exclusive community content

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🐛 Troubleshooting

### Login Issues
1. Ensure your Supabase URL and anon key are correct
2. Check that the database schema has been applied
3. Verify that RLS policies are properly configured
4. Check browser console for any error messages

### Database Issues
1. Run the SQL scripts in the correct order
2. Ensure all tables and policies are created
3. Check Supabase logs for any errors

### Build Issues
1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors with `npm run type-check`
3. Verify all imports are correct

## 📞 Support

For issues or questions, check the main README.md file or create an issue in the repository.
