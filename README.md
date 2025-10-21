# Goldmine Pro - Investment Platform

A comprehensive investment platform with MLM features, built with React and Node.js.

## Features

- **User Authentication**: Simple registration and login with mobile number and password
- **Investment Plans**: Multiple investment packages with different returns
- **Recharge System**: UPI-based recharge with UTR submission and admin approval
- **Withdrawal System**: Withdrawal requests with GST deduction and admin approval
- **Referral System**: Share referral links to earn commissions
- **Admin Panel**: Comprehensive admin dashboard to manage recharges and withdrawals
- **Responsive UI**: Mobile-first design with premium look and feel

## Tech Stack

- **Frontend**: React.js with Vite, styled-components, React Router
- **Backend**: Node.js, Express.js
- **Authentication**: JWT tokens with password hashing
- **Styling**: CSS3 with styled-components for dynamic styling

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the project root directory
2. Install dependencies: `npm install`
3. Start the server: `node server.js` (runs on port 8080)

### Frontend Setup

1. Navigate to the react-client directory: `cd react-client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev` (runs on port 3000)

### API Endpoints

#### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

#### Investment Plans
- `GET /api/plans` - Get all investment plans
- `POST /api/purchase` - Purchase an investment plan

#### Recharge
- `POST /api/recharge` - Submit recharge request
- `GET /api/recharge/history` - Get user's recharge history

#### Withdrawal
- `POST /api/withdraw` - Submit withdrawal request
- `GET /api/withdraw/history` - Get user's withdrawal history

#### Dashboard
- `GET /api/dashboard/stats` - Get user dashboard stats

#### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin dashboard data
- `PUT /api/admin/recharge/:id` - Update recharge status
- `PUT /api/admin/recharge/:id/reject` - Reject recharge request
- `PUT /api/admin/withdrawal/:id` - Update withdrawal status
- `PUT /api/admin/withdrawal/:id/reject` - Reject withdrawal request
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recharges` - Get all recharges
- `GET /api/admin/withdrawals` - Get all withdrawals

## Deployment

This application is ready for deployment to Netlify. The following steps outline the process:

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Build the project: `cd react-client && npm run build`
4. Run the build: `netlify deploy --prod`

The `netlify.toml` file in this repository is pre-configured for deployment.

For local development, you can use: `netlify dev`

## Architecture

The application follows a client-server architecture with a React frontend communicating with a Node.js/Express backend. The frontend implements a mobile-first responsive design with a bottom navigation for mobile users and side navigation for desktop users.

## Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Admin access controls
- Input validation
- Secure session management

## Business Logic

- One investment plan purchase per month per user
- Daily automatic income distribution to active plans
- 3% GST deduction on all withdrawals
- One withdrawal request per 24 hours per user
- Referral system with automatic bonus distribution

## Project Structure

```
mlm-website/
├── server.js (Backend server)
├── package.json
├── netlify.toml (Netlify configuration)
├── react-client/ (Frontend React app)
│   ├── src/
│   │   ├── components/ (Reusable components)
│   │   ├── contexts/ (React contexts)
│   │   ├── pages/ (Page components)
│   │   ├── services/ (API services)
│   │   └── utils/ (Utility functions)
│   ├── public/
│   ├── package.json
│   └── ...
```

## Usage

1. Start the backend server: `node server.js` (runs on port 8080)
2. Start the frontend development server in the react-client directory: `npm run dev` (runs on port 3000)
3. Access the application at `http://localhost:3000`

Admin access is available with any user that has the admin flag set to true.

## License

MIT License