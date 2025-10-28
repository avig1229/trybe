# Trybe - Creative Community Platform

**Trybe** is a unified full-stack digital platform designed to address the challenges of isolation, disorganized ideation, and limited collaborative support faced by creators during their iterative creative processes.

## 🎯 Project Overview

This is now a **single, cohesive codebase** that combines:
- ✅ Complete Next.js frontend with all Trybe features
- ✅ Supabase backend integration
- ✅ Authentication system with multiple login methods
- ✅ Project Valley, Collective Pulse, and Tribes functionality
- ✅ File storage and media management
- ✅ Responsive design and modern UI

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

### 2. Database Setup
Run these SQL scripts in your Supabase SQL Editor:
1. `enhanced-schema.sql` - Complete database schema
2. `storage-setup.sql` - File storage configuration

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Test Login
Visit `http://localhost:3000/auth/login` to test authentication.

## 📁 Unified Project Structure

```
trybe/                          # Root directory (unified codebase)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   └── callback/      # OAuth callback
│   │   ├── valley/            # Main application
│   │   └── api/               # API routes
│   ├── components/            # React Components
│   │   ├── ui/               # Base UI components
│   │   ├── navigation.tsx    # Main navigation
│   │   ├── dashboard.tsx     # Dashboard view
│   │   ├── project-valley.tsx # Project management
│   │   ├── collective-pulse.tsx # Community feed
│   │   └── tribes.tsx        # Community management
│   ├── contexts/             # React Contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                  # Utilities
│   │   ├── supabase/         # Supabase integration
│   │   │   ├── client.ts     # Client-side Supabase
│   │   │   ├── server.ts     # Server-side Supabase
│   │   │   └── queries.ts    # Database queries
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript definitions
│       └── index.ts          # All type definitions
├── enhanced-schema.sql        # Database schema
├── storage-setup.sql         # Storage configuration
├── SETUP.md                  # Setup instructions
└── README.md                 # This file
```

## 🔐 Authentication System

The login system supports multiple authentication methods:

### Email/Password Login
- Traditional email and password authentication
- Form validation and error handling
- Secure password requirements

### Google OAuth
- One-click Google sign-in
- Automatic profile creation
- Seamless user experience

### Magic Links
- Passwordless authentication
- Email-based login links
- Enhanced security

### Profile Management
- Automatic profile creation on first login
- Extended user profiles with creative information
- Avatar and bio management

## 🎨 Core Features

### 1. Project Valley
- **Visual Project Management**: Organize projects with color coding and status tracking
- **Channels & Blocks**: Flexible content organization system
- **Portfolio Integration**: Develop projects into portfolio-ready presentations
- **Search & Filter**: Find projects by status, tags, or keywords

### 2. Collective Pulse
- **Progress Updates**: Share work-in-progress with the community
- **Showcase Posts**: Highlight completed work and achievements
- **Collaboration Requests**: Find and connect with creative partners
- **Community Engagement**: Like, comment, and save posts

### 3. Tribes
- **Community Discovery**: Find specialized creative communities
- **Tribe Creation**: Create and manage your own communities
- **Membership Management**: Join/leave tribes with role-based access
- **Exclusive Content**: Access tribe-specific resources and discussions

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Query for server state
- **Authentication**: Supabase Auth with profile management
- **File Storage**: Supabase Storage with RLS policies
- **Database**: PostgreSQL with comprehensive RLS security

## 📱 User Experience

### Navigation Flow
1. **Landing Page** → Authentication
2. **Dashboard** → Personalized overview and quick actions
3. **Project Valley** → Organize and manage creative projects
4. **Collective Pulse** → Engage with the community
5. **Tribes** → Discover and join specialized communities

### Key UX Features
- **Responsive Design**: Works seamlessly across all devices
- **Real-time Updates**: Live community interactions
- **Drag & Drop**: Intuitive file and content organization
- **Search & Filter**: Powerful discovery tools
- **Progressive Enhancement**: Core functionality without JavaScript

## 🔄 Development Workflow

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Key Development Files
- `src/types/index.ts` - Comprehensive TypeScript definitions
- `src/lib/supabase/queries.ts` - Database query functions
- `src/contexts/AuthContext.tsx` - Authentication and profile management
- `enhanced-schema.sql` - Complete database schema
- `storage-setup.sql` - File storage configuration

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Configure your hosting platform

## 🐛 Troubleshooting

### Login Issues
1. Verify Supabase URL and anon key in `.env.local`
2. Ensure database schema has been applied
3. Check RLS policies are properly configured
4. Review browser console for errors

### Database Issues
1. Run SQL scripts in correct order
2. Verify all tables and policies exist
3. Check Supabase logs for errors

### Build Issues
1. Run `npm install` to ensure dependencies
2. Check TypeScript errors with `npm run type-check`
3. Verify all imports are correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Capstone Project**: Developed as part of a university capstone program
- **Community Focus**: Inspired by the need for better creative collaboration tools
- **Open Source**: Built with love for the creative community

---

**Trybe** - Cultivating Collaborative Flow & Creative Belonging 🎨✨

*Now a unified, cohesive codebase ready for development and testing!*