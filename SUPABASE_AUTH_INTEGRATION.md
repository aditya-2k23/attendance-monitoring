# Supabase Authentication Integration

## Changes Made

### 1. AuthContext Updates

- **Replaced mock authentication** with Supabase auth
- **Email-based login** instead of userId/role selection
- **Automatic role detection** from database tables (students/teachers) or user metadata
- **Session persistence** and automatic restoration on app start
- **User profile loading** from students/teachers tables
- **Admin detection** via email keywords or user metadata

### 2. Login Screen Updates

- **Removed role selector** - roles are now automatically detected
- **Changed from userId to email** input field
- **Updated validation** to check for valid email format
- **Simplified demo credentials** section

### 3. AddUser Component Improvements

- **Removed unused variables** (data, signInBackData, insertData)
- **Enhanced validation** including email format validation and password length checks
- **Better error handling** and user feedback
- **AuthContext integration** with refreshUser() after adding users
- **Improved user creation flow** with better admin session management

## How the New Authentication Works

### 1. User Login Process

1. User enters email and password
2. AuthContext attempts Supabase auth login
3. If successful, system checks for user profile in:
   - students table (for student role)
   - teachers table (for teacher role)
   - user metadata (for admin role)
4. User object is created with appropriate role and profile data
5. App redirects based on user role

### 2. Admin User Creation Process

1. Admin logs in and accesses Admin Dashboard
2. Admin clicks "Add User" to open the AddUser modal
3. Admin fills out user details including:
   - Full name
   - Email address
   - Student/Teacher ID
   - Department
   - Role (student/teacher)
   - Temporary password
   - Admin password for confirmation
4. System creates Supabase auth user
5. System inserts profile data into appropriate table (students/teachers)
6. Admin session is restored automatically
7. Success message is shown

### 3. New User Login Process

1. New user receives email and temporary password from admin
2. User logs in with provided credentials
3. System automatically detects role from database
4. User is redirected to appropriate dashboard

## Database Schema Requirements

Make sure your Supabase database has these tables:

### students table

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  enrollment_year INTEGER NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### teachers table

```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  teacher_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Storage bucket for photos

```sql
-- Create a storage bucket for user photos
INSERT INTO storage.buckets (id, name, public) VALUES ('user-photos', 'user-photos', true);
```

## Environment Variables Required

Make sure your `.env.local` file contains:

```env
EXPO_PUBLIC_PROJECT_URL=your_supabase_project_url
EXPO_PUBLIC_API_KEY=your_supabase_anon_key
```

## Testing the Integration

### 1. Create an Admin User

Since there are no mock users anymore, you'll need to create an admin user manually in Supabase:

1. Go to your Supabase Auth dashboard
2. Create a new user with an email containing "admin" (e.g., `admin@example.com`)
3. Set a password
4. Add user metadata: `{"role": "admin", "full_name": "Admin User"}`

### 2. Test Admin Login

1. Open the app
2. Enter admin email and password
3. Verify you're redirected to Admin Dashboard

### 3. Test User Creation

1. In Admin Dashboard, click "Add User"
2. Fill out the form with student/teacher details
3. Set a temporary password
4. Enter your admin password
5. Submit the form
6. Verify success message appears

### 4. Test New User Login

1. Log out from admin
2. Use the email and temporary password you set for the new user
3. Verify user is redirected to appropriate dashboard (student/teacher)

## Key Benefits

1. **Real authentication** - No more mock users
2. **Secure user creation** - Admin password confirmation required
3. **Automatic role detection** - No manual role selection needed
4. **Session persistence** - Users stay logged in between app launches
5. **Profile integration** - User data comes from actual database
6. **Photo support** - Users can have profile photos stored in Supabase storage
7. **Better validation** - Enhanced form validation for email and passwords
8. **Error handling** - Comprehensive error messages and user feedback

## Security Features

1. **Admin verification** - Admin password required for user creation
2. **Session restoration** - Admin session automatically restored after creating users
3. **Input validation** - Email format and password strength validation
4. **Database constraints** - Unique constraints on student/teacher IDs
5. **Auth session checks** - Proper session validation before operations
