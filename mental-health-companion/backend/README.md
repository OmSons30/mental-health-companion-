# Mental Health Companion Backend API

A secure Express.js backend API with Supabase integration for authentication and transaction management.

## 🚀 Features

- **Authentication**: Signup, login, logout with Supabase Auth
- **Transaction Management**: CRUD operations for financial transactions
- **Security**: JWT authentication, rate limiting, CORS protection
- **Validation**: Input validation using express-validator
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (for additional token handling if needed)
JWT_SECRET=your_jwt_secret_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Supabase Database Setup

Create the following tables in your Supabase database:

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and return session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

### Transaction Endpoints

#### POST `/api/transactions`
Create a new transaction (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 100.50,
  "type": "expense",
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2024-01-15T10:30:00Z"
}
```

#### GET `/api/transactions`
Get all transactions for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by transaction type
- `category` (optional): Filter by category
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date

#### GET `/api/transactions/:id`
Get a specific transaction by ID (requires authentication).

#### PUT `/api/transactions/:id`
Update a transaction (requires authentication).

#### DELETE `/api/transactions/:id`
Delete a transaction (requires authentication).

#### GET `/api/transactions/summary`
Get transaction summary/statistics (requires authentication).

**Query Parameters:**
- `start_date` (optional): Start date for summary
- `end_date` (optional): End date for summary

**Response:**
```json
{
  "summary": {
    "total_transactions": 25,
    "total_income": 5000.00,
    "total_expenses": 3200.50,
    "net_amount": 1799.50,
    "by_category": {
      "Food": 800.00,
      "Transport": 400.00
    },
    "by_type": {
      "income": 10,
      "expense": 15,
      "transfer": 0
    }
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Comprehensive request validation
- **Helmet**: Security headers middleware
- **Row Level Security**: Database-level security with Supabase RLS

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:5000/health
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [] // Optional validation details
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
JWT_SECRET=your_secure_jwt_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start server.js --name "mental-health-api"
pm2 save
pm2 startup
```

## 📁 Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   └── transactions.js      # Transaction routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
└── README.md                # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 