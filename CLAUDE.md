# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based table tennis tournament management application built with TypeScript, Vite, and modern React ecosystem tools. The application provides comprehensive tournament management features including brackets, player management, scheduling, and media handling.

## Development Commands

### Essential Commands
- **Development server**: `pnpm dev` (runs on port 5174 with host flag enabled)
- **Build**: `pnpm run build` (TypeScript compilation followed by Vite build)
- **Lint**: `pnpm run lint` (ESLint check)
- **Lint fix**: `pnpm run lint:fix` (ESLint with auto-fix)
- **Preview**: `pnpm run preview` (preview built application)

### Package Management
- **Package manager**: pnpm (version 9.12.3+ specified in packageManager field)
- **Node version**: 18-20 (GitHub Actions use both versions)
- **Install dependencies**: `pnpm install`

## Architecture & Tech Stack

### Core Framework
- **React 18.3.1** with TypeScript
- **Vite** as build tool with SWC for fast refresh
- **TanStack Router** for file-based routing with automatic route generation
- **TanStack Query** for server state management with React Query DevTools

### UI & Styling
- **Tailwind CSS** with custom design system and shadcn/ui components
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** and **React Icons** for iconography
- **next-themes** for dark mode support

### State Management & Data Fetching
- **TanStack Query** for server state and caching
- **Axios** for HTTP requests with configured base instance
- **React Hook Form** with Zod validation for forms
- **Zustand-like providers** for global state (UserProvider, etc.)

### Specialized Features
- **@dnd-kit** suite for drag-and-drop functionality (tournament brackets, regrouping)
- **Yoopta Editor** for rich text editing (blog posts)
- **React DatePicker** and **React Day Picker** for date handling
- **html2canvas** and **jsPDF** for PDF generation
- **i18next** with browser language detection for internationalization (ET/EN)
- **recharts** for data visualization

### File Structure
```
src/
├── components/          # Reusable UI components and tournament-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared logic
├── providers/          # React context providers
├── queries/            # TanStack Query configurations and API calls
├── routes/             # File-based routing structure (TanStack Router)
├── types/              # TypeScript type definitions
└── i18n.ts            # Internationalization setup
```

### Routing Structure
- **File-based routing** with TanStack Router
- **Route generation** handled automatically via `@tanstack/router-plugin`
- **Nested layouts** for admin and public sections
- **Admin routes** (`/admin/*`) have separate navigation and layout
- **Protected routes** with user authentication context

### API Integration
- **Axios instance** configured in `src/queries/axiosconf.ts`
- **Environment-based** API URL configuration
- **Bearer token** authentication using `VITE_TOURNAMENT10_PUBLIC_KEY`
- **Modular query files** for different entities (tournaments, players, matches, etc.)

## Development Workflow

### Branch Strategy
- **Main branch**: `main` (production deployments)
- **Development branch**: `development` (active development)
- **Feature branches**: merged to development via PR

### Deployment via Labels
The project uses GitHub Actions with label-triggered deployments:
- **"deploy to test"**: Deploys to test.eltl.ee from development branch
- **"merge to development"**: Auto-merges approved PRs to development
- **"deploy to production"**: Deploys from development to main branch

### Code Quality
- **ESLint** with React-specific rules and React Compiler plugin
- **TypeScript** strict configuration with path aliases
- **Tailwind CSS** for consistent styling
- **Component-driven** architecture with reusable UI components

## Key Patterns

### Component Organization
- **UI components** in `src/components/ui/` (shadcn/ui based)
- **Feature components** organized by domain
- **Route-specific components** in `src/routes/-components/`
- **Shared utilities** in `src/lib/utils.ts`

### Data Fetching
- **TanStack Query** for all server state
- **Custom hooks** for complex data operations
- **Type-safe** API responses with TypeScript definitions

### Form Handling
- **React Hook Form** with Zod schemas
- **Reusable form components** with consistent validation
- **TypeScript** integration for form data types

### Tournament Features
The application specializes in table tennis tournament management with:
- **Bracket generation** (single/double elimination, group stage)
- **Player registration** and management
- **Match scheduling** and scoring
- **Live tournament** tracking and results
- **Media management** (images, videos)
- **PDF protocol** generation and export

### Internationalization
- **i18next** setup with Estonian and English support
- **Browser language** detection
- **Translation files** in `public/locales/`

## Admin System - Tournament Management

This section provides comprehensive guidance for administrators working with the tournament management system. The admin interface is designed for tournament organizers to efficiently create, manage, and run table tennis tournaments.

### Admin Access & Security

#### Role-Based Access Control
The system implements a hierarchical role structure with specific permissions:

- **ROOT_ADMIN**: Full system access (all tournaments, blogs, clubs, feedback management)
- **ORG_ADMIN**: Organizational-level tournament management within their organization
- **SOLO_ADMIN**: Individual tournament administration (create and manage own tournaments)
- **MEDIA_ADMIN**: Blog and media content management capabilities
- **USER**: Basic user access (participation only)

#### Authentication & Security Features
- **JWT-based Authentication**: Secure token-based login system with cookie persistence
- **Protected Routes**: All admin routes (`/admin/*`) require valid authentication
- **Role Verification**: Server-side permission validation for all admin operations
- **Automatic Redirects**: Unauthorized users redirected to home page
- **Session Management**: Persistent login state with automatic token refresh

### Admin Navigation & Layout

#### Main Layout Structure
```
/admin/
├── dashboard/          # Analytics and overview
├── tournaments/        # Tournament lifecycle management
├── blog/              # Content management system  
├── clubs/             # Club and player administration (ROOT_ADMIN)
└── feedback/          # User feedback management
```

#### Navigation Features
- **Collapsible Sidebar**: User preference persistence via cookies
- **Role-based Menu Items**: Dynamic navigation based on user permissions
- **Mobile Responsive**: Bottom navigation bar for mobile devices
- **Theme Integration**: Dark mode support and language selector
- **Breadcrumb Navigation**: Clear path indication for nested routes

### Tournament Management

#### Tournament Creation Workflow

**Step 1: Basic Tournament Setup**
- Navigate to `/admin/tournaments/new`
- Complete tournament information form with Zod validation
- Required fields: name, date, location, organizer contact
- Optional: description (rich text via Yoopta Editor), registration settings

**Step 2: Tournament Configuration**
- **Sport Settings**: Sport type selection (table tennis)
- **Table Management**: Physical venue table allocation (1-200 tables)
- **Rating Integration**: ELTL rating coefficient (1.0-2.0 multiplier)
- **Visibility**: Public/private tournament setting
- **Registration Method**: 
  - Internal system registration
  - Google Forms integration 
  - Excel sheet linking
  - Manual participant entry

**Step 3: Media & Promotion**
- **Image Upload**: Tournament banner and gallery images
- **Sponsor Management**: Logo uploads and sponsor information
- **Social Sharing**: Tournament promotion tools

#### Tournament Settings Reference

**Essential Configuration Options**:
- `tournament_name`: Display name (required)
- `date_start` / `date_end`: Tournament duration (multi-day support)
- `location`: Venue information with address
- `organizer_name` / `organizer_email`: Contact details
- `tables_count`: Physical venue table count (1-200)
- `coefficient`: ELTL rating multiplier (1.0-2.0)
- `is_public`: Visibility setting (true/false)
- `registration_type`: Internal/Google Forms/Excel/Manual

### Group & Bracket Management

#### Group Creation Process
- Navigate to `/admin/tournaments/{id}/grupid/uus`
- **Group Configuration**:
  - Group name and description
  - Tournament stage (qualification, finals, etc.)
  - Bracket type: single elimination, double elimination, group stage, team league
  - Class filters: age groups, skill levels, gender categories
  - Advancement rules: number of players advancing to next stage

#### Bracket Types & Use Cases
- **Single Elimination**: Standard knockout format, fastest completion
- **Double Elimination**: Winners and losers brackets, more fair for participants  
- **Group Stage**: Round-robin within groups, good for skill assessment
- **Team League**: Club vs club competition format
- **Dynamic Brackets**: Real-time bracket generation based on results

#### Class Management
Groups can be organized by multiple classification systems:
- **Age Groups**: Youth, Junior, Adult, Senior categories
- **Skill Levels**: Beginner, Intermediate, Advanced, Professional
- **Gender**: Men's, Women's, Mixed categories  
- **Team Structure**: Individual, Doubles, Team competitions

### Participant Management

#### Player Registration Methods

**Internal System Registration**:
- Players register directly through the tournament page
- Automatic validation against Estonian ID system
- Real-time availability checking
- Payment integration (if required)

**Manual Player Entry** (Admin):
1. Navigate to `/admin/tournaments/{id}/grupid/{groupId}/osalejad`
2. Choose participant type: Solo, Doubles, Teams
3. **Player Search**: Real-time search with debounced queries
4. **New Player Creation**: Full player profile creation
5. **Estonian ID Integration**: Automatic birth date extraction
6. **License Validation**: Check player license status and expiration

**Player Database Features**:
- **Search Functionality**: Fast player lookup by name, club, or ID
- **Player Creation**: New player registration with validation
- **License Tracking**: License status and expiration monitoring
- **Rating Integration**: ELTL points and rankings display
- **Foreign Player Support**: Special handling for international participants
- **Club Assignment**: Player-club relationship management

#### Seeding & Organization
- **Drag & Drop Interface**: Visual participant reordering
- **Automatic Seeding**: Based on ELTL ratings or previous results
- **Manual Seeding**: Admin override capability
- **Group Balancing**: Even distribution across skill levels
- **Withdrawal Handling**: Player removal and bracket adjustment

### Match Management & Scoring

#### Live Match Administration

**Match States & Workflow**:
1. **Created**: Match scheduled but not started
2. **Ongoing**: Match in progress with live scoring
3. **Finished**: Match completed with final results
4. **Forfeited**: Match ended due to player withdrawal

**Scoring Interface** (`/admin/tournaments/{id}/mangud`):
- **Real-time Score Entry**: Live match scoring with set management
- **Table Assignment**: Physical table allocation and management
- **Time Tracking**: Match start times and duration monitoring
- **Match Statistics**: Performance metrics and historical data
- **Protocol Generation**: Automated match result documentation

#### Table Management System

**Physical Table Mapping**:
- Navigate to `/admin/tournaments/{id}/lauad`
- **Table Configuration**: Map virtual matches to physical venue tables
- **Status Monitoring**: Real-time table occupancy tracking
- **Match Timers**: Visual duration alerts (20min: orange, 30min: red)
- **Multi-venue Support**: Different locations with separate table numbering

**Table Assignment Strategies**:
- **Automatic Assignment**: System-optimized table allocation
- **Manual Override**: Admin-controlled table assignment
- **Load Balancing**: Even distribution across available tables
- **Priority Matching**: Finals and important matches on preferred tables

### Advanced Tournament Features

#### Regrouping & Bracket Modification
Path: `/admin/tournaments/{id}/grupid/{groupId}/osalejad`

**Dynamic Regrouping Tools**:
- **Drag & Drop Interface**: Visual participant reorganization
- **Bulk Operations**: Mass participant moves between groups
- **Bracket Restructuring**: Real-time tournament format changes
- **Seeding Reset**: Complete bracket regeneration
- **Advancement Management**: Control player progression between stages

**Important Considerations**:
- Regrouping affects all future matches in the tournament
- Completed matches remain unchanged
- Player notifications sent automatically for schedule changes
- Rating calculations updated based on new groupings

#### Scheduling & Time Management

**Tournament Scheduling** (`/admin/tournaments/{id}/ajakava`):
- **Multi-day Planning**: Day-by-day schedule organization
- **Time Slot Generation**: Automated scheduling with configurable intervals
- **Round Management**: Sequential round progression
- **Break Scheduling**: Rest periods between rounds
- **Venue Coordination**: Multiple court/table management

**Timetable Configuration**:
- Navigate to `/admin/tournaments/{id}/ajakava/seaded`
- **Session Planning**: Morning, afternoon, evening sessions
- **Match Duration**: Standard time allocations per match type
- **Buffer Time**: Delay management and catch-up periods
- **Resource Allocation**: Table and official assignments

**Visual Timetable Features**:
- **Grid View**: Time slots vs tables matrix display
- **Color Coding**: Group identification and match status
- **Real-time Updates**: Live schedule changes and notifications  
- **Export Capabilities**: PDF schedule generation
- **Mobile Optimization**: Responsive design for tournament staff

### Media & Content Management

#### Tournament Media Management
- **Image Galleries**: Tournament photo organization and display
- **File Upload**: Drag-and-drop media handling with preview
- **Image Optimization**: Automatic resizing and compression
- **Sponsor Integration**: Logo placement and sponsor information
- **Social Media**: Sharing tools and promotional content

#### Blog & Content System (MEDIA_ADMIN)
Path: `/admin/blog`

**Content Creation Workflow**:
1. **Rich Text Editor**: Yoopta Editor for professional content creation
2. **Media Integration**: In-line image and video embedding
3. **Publishing States**: Draft → Review → Published → Archived
4. **SEO Optimization**: Meta descriptions and keyword management
5. **Multilingual Support**: Estonian and English content versions

**Blog Management Features**:
- **Content Search**: Title and content-based filtering
- **Publication Scheduling**: Future publication dates
- **Author Management**: Multi-author blog support
- **Comment System**: Reader engagement tools
- **Analytics Integration**: Content performance tracking

### Data Management & Analytics

#### Tournament Analytics Dashboard
Path: `/admin/dashboard`

**Key Metrics Display**:
- **Active Tournaments**: Currently running tournaments count
- **Total Tournaments**: Historical tournament count  
- **User Statistics**: Total registered users and recent signups
- **Activity Charts**: Monthly tournament distribution visualization
- **Performance Metrics**: Tournament success rates and completion statistics

**Time-based Personalization**:
- Dynamic greeting messages based on time of day
- Localized date and time displays
- Time zone handling for international tournaments

#### Protocol & Export System

**Automated Documentation**:
- **Match Protocols**: PDF generation for official match results
- **Tournament Standings**: Real-time ranking calculations
- **Statistics Reports**: Player and match performance data
- **Export Formats**: PDF, Excel, CSV export capabilities
- **Official Documentation**: Tournament official protocols

### Club & Player Administration (ROOT_ADMIN)

#### Club Management System
Path: `/admin/clubs`

**Club Lifecycle Management**:
- **Club Creation**: New club registration with validation
- **Contact Information**: Official contact details and addresses  
- **Player Roster**: Add/remove players from clubs
- **License Management**: Club-level license tracking
- **Communication**: Club official notifications

**Player Database Administration**:
- **Global Player Search**: System-wide player lookup
- **Profile Management**: Player information updates
- **License Tracking**: Expiration monitoring and renewal alerts
- **Rating Management**: ELTL points and ranking maintenance
- **Audit Trail**: Player activity and change history

### Error Handling & Troubleshooting

#### Common Admin Issues & Solutions

**Tournament Creation Problems**:
- **Validation Errors**: Check required fields and date formats
- **Table Allocation**: Ensure venue has sufficient physical tables
- **Permission Issues**: Verify user role has tournament creation rights

**Match Management Issues**:
- **Score Entry Errors**: Verify match is in correct state (ongoing)
- **Table Assignment**: Check physical table availability and conflicts
- **Time Conflicts**: Review schedule overlaps and resource allocation

**Player Registration Problems**:
- **Estonian ID Validation**: Verify ID format and check against database
- **License Issues**: Check license expiration and renewal status
- **Duplicate Players**: Search existing database before creating new players

#### Performance Optimization

**Large Tournament Handling**:
- **Virtual Scrolling**: Efficient rendering of large participant lists
- **Lazy Loading**: Progressive data loading for improved performance  
- **Caching Strategy**: Intelligent data caching with TanStack Query
- **Background Sync**: Non-blocking data updates

### Best Practices for Administrators

#### Tournament Planning Checklist
1. **Pre-Tournament** (1-2 weeks before):
   - Create tournament with complete information
   - Set up groups and bracket structure
   - Configure tables and venue mapping
   - Test registration system
   - Upload promotional materials

2. **Tournament Setup** (day before):
   - Finalize participant list and seeding
   - Generate and print match protocols
   - Verify table assignments and equipment
   - Brief tournament staff on procedures
   - Test scoring system connectivity

3. **During Tournament**:
   - Monitor match progress and timing
   - Handle player disputes and protests
   - Update scores and results promptly
   - Manage schedule adjustments
   - Coordinate with venue staff

4. **Post-Tournament**:
   - Finalize all results and standings
   - Update player ratings (ELTL integration)
   - Generate official protocols
   - Archive tournament media
   - Gather feedback for improvements

#### Security & Data Protection
- **Input Validation**: All forms include comprehensive validation
- **XSS Protection**: Input sanitization across all user inputs
- **Role Verification**: Server-side permission checking
- **Data Backup**: Automatic tournament data preservation
- **Privacy Compliance**: GDPR-compliant data handling

#### Accessibility & Usability
- **WCAG Compliance**: Accessible interface design
- **Mobile Optimization**: Full functionality on all device types
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Blind Friendly**: Accessible color schemes and contrast

### Technical Implementation Notes

#### File Locations Reference
- **Admin Layout**: `src/routes/admin/layout.tsx`
- **Tournament Components**: `src/routes/admin/tournaments/-components/`
- **Match Management**: `src/routes/admin/tournaments/$tournamentid/-components/`  
- **User Management**: `src/queries/users.ts`
- **Tournament Queries**: `src/queries/tournaments.ts`
- **Type Definitions**: `src/types/` directory

#### Key Hooks & Utils
- **useUser()**: User authentication and role checking
- **useParticipantUtils**: Participant management utilities
- **Tournament queries**: TanStack Query configurations for all tournament operations
- **Form validation**: Zod schemas with i18n error messages

This admin system provides professional-grade tournament management capabilities suitable for local clubs to international championships, with comprehensive player management, real-time match tracking, and automated administrative workflows.