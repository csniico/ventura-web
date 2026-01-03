# Ventura Web Application

**Universal Business Management Platform for Modern Entrepreneurs**

## 🎯 Project Overview

Ventura is a comprehensive business management platform designed for any business owner who sells products or services. Whether you're a retailer, wholesaler, event planner, or spare parts dealer, Ventura provides the tools you need to manage your business efficiently.

## 🏢 Target Business Types

- **Retailers** - Store inventory, customer orders, sales management
- **Wholesalers** - Bulk orders, supplier relationships, B2B invoicing
- **Event Planners** - Vendor coordination, event packages, client billing
- **Spare Parts Dealers** - Parts catalog, customer requests, inventory tracking
- **Service Providers** - Any business selling products or services

## ✨ Core Features

### 📊 Sales Management
- **Invoices** - Professional billing and payment tracking
- **Orders** - Customer order management and fulfillment
- **Inventory** - Product/service catalog and stock management

### 📅 Business Operations
- **Appointments** - Client meetings and consultation scheduling
- **Business Profile** - Company branding and information management
- **Dashboard** - Real-time business insights and analytics

### 👤 User Management
- **Authentication** - Secure login with email verification
- **Profile Management** - Personal and business profile customization
- **Multi-user Support** - Team collaboration features

## 🛠 Technology Stack

### Frontend (Angular 21)
- **Framework**: Angular 21 with standalone components
- **Styling**: TailwindCSS v4 with Inter font
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with RxJS
- **Type Safety**: TypeScript with strict mode

### Backend Integration
- **API**: NestJS backend with TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 integration
- **Email**: Nodemailer with templates

## 📱 Platform Consistency

This web application mirrors the mobile app structure to ensure consistent user experience across platforms:

- **Home Dashboard** - Business overview and quick actions
- **Sales Module** - Invoices, Orders, and Inventory management
- **Appointments** - Client scheduling and meeting management
- **Profile** - User and business profile management

## 🏗 Project Structure

```
src/app/
├── core/                    # Core functionality (singletons)
│   ├── services/           # Global services (auth, notifications, etc.)
│   ├── interceptors/       # HTTP interceptors
│   └── index.ts           # Barrel exports
├── features/              # Feature modules
│   ├── auth/             # Authentication & user management
│   ├── dashboard/        # Home dashboard
│   ├── sales/           # Sales management (invoices, orders, inventory)
│   ├── appointments/    # Appointment scheduling
│   └── profile/         # User & business profiles
├── shared/               # Shared utilities
│   ├── models/          # TypeScript interfaces
│   ├── components/      # Reusable UI components
│   ├── constants/       # Application constants
│   └── utils/          # Helper functions
└── environments/        # Environment configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js v20.19+ or v22.12+
- npm or pnpm
- Angular CLI v21+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ventura-web

# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands
```bash
npm start              # Start development server (http://localhost:4200)
npm run build         # Build for production
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm test              # Run unit tests
```

## 🔧 Configuration

### Environment Variables
- `apiUrl` - Backend API base URL
- `production` - Production mode flag

### Code Quality
- **ESLint** - Angular-specific linting rules
- **Prettier** - Consistent code formatting
- **TypeScript** - Strict type checking
- **Husky** - Git hooks for code quality

## 📋 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Angular 21
- [x] Professional code quality tools
- [x] HTTP interceptors and error handling
- [x] TypeScript interfaces and models
- [x] Shared utilities and constants

### Phase 2: Authentication & Core
- [ ] Login/Register pages
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Business profile setup

### Phase 3: Sales Management
- [ ] Dashboard with business metrics
- [ ] Invoice creation and management
- [ ] Order tracking and fulfillment
- [ ] Inventory management system

### Phase 4: Advanced Features
- [ ] Appointment scheduling
- [ ] Payment integration
- [ ] Reporting and analytics
- [ ] Multi-user collaboration

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write meaningful commit messages
3. Create feature branches for new functionality
4. Ensure all tests pass before submitting PRs

## 📄 License

This project is proprietary software. All rights reserved.

## 🔗 Related Projects

- **Backend API**: NestJS application with PostgreSQL
- **Mobile App**: Flutter application with same feature set
- **Documentation**: Comprehensive API documentation

---

**Built with ❤️ for modern business owners who deserve better tools.**

Professional Frontend Development Plan - Backend API Analysis
✅ Available Backend APIs & Required Frontend Pages:
🔐 Authentication Module
Backend APIs:

POST /auth/signup - User registration

POST /auth/signin - User login

POST /auth/verify-code - Email verification

POST /auth/resend-code - Resend verification code

POST /auth/confirm-email - Confirm email for password reset

POST /auth/reset-password - Reset password

GET /auth/google/login/web - Google OAuth

POST /auth/logout - User logout

Frontend Pages Needed:

Login Page (/auth/login)

Register Page (/auth/register)

Email Verification Page (/auth/verify-email)

Forgot Password Page (/auth/forgot-password)

Reset Password Page (/auth/reset-password)

👤 User Management Module
Backend APIs:

GET /users - Get all users (admin)

GET /users/:userId - Get user profile

PATCH /users/profile/:userId - Update user profile

POST /users/:userId/change-password - Change password

DELETE /users/:id - Delete user

Frontend Pages Needed:

User Profile Page (/profile/personal)

Edit Profile Page (/profile/edit)

Security Settings Page (/profile/security)

🏢 Business Management Module
Backend APIs:

GET /businesses - Get all businesses

GET /businesses/:id - Get business details

POST /businesses - Create business profile

PUT /businesses/:id - Update business profile

Frontend Pages Needed:

Business Profile Page (/profile/business)

Create Business Page (/business/create)

Edit Business Page (/business/edit)

📅 Appointment Module
Backend APIs:

GET /appointments/user?userId= - Get user appointments

GET /appointments/business?businessId= - Get business appointments

POST /appointments - Create appointment

PUT /appointments/:id - Update appointment

DELETE /appointments/:id - Delete appointment

Frontend Pages Needed:

Appointments Dashboard (/appointments)

Create Appointment Page (/appointments/create)

Edit Appointment Page (/appointments/edit/:id)

Appointment Details Page (/appointments/:id)

📁 File Storage Module
Backend APIs:

POST /assets/images - Upload images

Frontend Components Needed:

File Upload Component (for avatars, business logos)

Image Gallery Component

📧 Mail Module
Backend APIs:

POST /mailer/send-email - Send emails

Frontend Integration:

Contact forms, notifications (already implemented)

🎯 Professional Development Priority:
Phase 1: Core Authentication (Week 1)
Login/Register pages with form validation

Email verification flow

Password reset functionality

Route guards for protected pages

Phase 2: User & Business Profiles (Week 2)
User profile management

Business profile creation/editing

File upload for avatars/logos

Security settings

Phase 3: Main Dashboard (Week 3)
Home dashboard with business metrics

Navigation layout (sidebar/mobile)

Quick actions and overview cards

Phase 4: Appointments System (Week 4)
Appointments CRUD operations

Calendar integration

Appointment scheduling interface

🚀 Next Steps:
Should we start with Phase 1 - Authentication pages? This gives us:

Complete user onboarding flow

Secure access to the application

Foundation for all other features