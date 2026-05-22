<<<<<<< HEAD
# Admin Portal Credentials

## 🔐 Current Admin Credentials

**Email:** `admin@healthtracker.com`  
**Password:** `Admin@123456`  
**Name:** System Administrator

## 📝 How to Update .env File

Update the following in `server/.env`:

```env
ADMIN_EMAIL=admin@healthtracker.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Administrator
```

## 🔄 How to Reset Admin Credentials

### Option 1: Use Default Script (Creates with default credentials)
```bash
cd server
node reset-admin.js
```

This will:
- Delete all existing admin accounts
- Create a new admin with default credentials:
  - Email: `admin@healthtracker.com`
  - Password: `Admin@123456`
  - Name: `System Administrator`

### Option 2: Create Custom Admin Credentials
```bash
cd server
node create-admin-custom.js <email> <password> [name]
```

**Examples:**
```bash
# Basic usage
node create-admin-custom.js admin@example.com MySecurePass123

# With custom name
node create-admin-custom.js admin@example.com MySecurePass123 "John Admin"
```

This will:
- Delete all existing admin accounts
- Create a new admin with your custom credentials

## ⚠️ Important Notes

1. **Old admin accounts are automatically deleted** when creating a new one
2. **Passwords are hashed** in the database for security
3. **Update your .env file** after creating a new admin to ensure the server can auto-create it on startup
4. **Keep credentials secure** - don't commit them to version control

## 🔒 Security Best Practices

- Use a strong password (at least 8 characters, mix of letters, numbers, and symbols)
- Change default credentials immediately in production
- Don't share admin credentials
- Use environment variables for sensitive data

## 🚀 Access Admin Portal

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter the admin email and password
3. You'll be redirected to the admin dashboard

## 📋 Verify Admin Account

To check if admin account exists:
```bash
cd server
node retrieve-credentials.js
```

This will show all users and admin accounts in the database.

=======
# Admin Portal Credentials

## 🔐 Current Admin Credentials

**Email:** `admin@healthtracker.com`  
**Password:** `Admin@123456`  
**Name:** System Administrator

## 📝 How to Update .env File

Update the following in `server/.env`:

```env
ADMIN_EMAIL=admin@healthtracker.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=System Administrator
```

## 🔄 How to Reset Admin Credentials

### Option 1: Use Default Script (Creates with default credentials)
```bash
cd server
node reset-admin.js
```

This will:
- Delete all existing admin accounts
- Create a new admin with default credentials:
  - Email: `admin@healthtracker.com`
  - Password: `Admin@123456`
  - Name: `System Administrator`

### Option 2: Create Custom Admin Credentials
```bash
cd server
node create-admin-custom.js <email> <password> [name]
```

**Examples:**
```bash
# Basic usage
node create-admin-custom.js admin@example.com MySecurePass123

# With custom name
node create-admin-custom.js admin@example.com MySecurePass123 "John Admin"
```

This will:
- Delete all existing admin accounts
- Create a new admin with your custom credentials

## ⚠️ Important Notes

1. **Old admin accounts are automatically deleted** when creating a new one
2. **Passwords are hashed** in the database for security
3. **Update your .env file** after creating a new admin to ensure the server can auto-create it on startup
4. **Keep credentials secure** - don't commit them to version control

## 🔒 Security Best Practices

- Use a strong password (at least 8 characters, mix of letters, numbers, and symbols)
- Change default credentials immediately in production
- Don't share admin credentials
- Use environment variables for sensitive data

## 🚀 Access Admin Portal

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter the admin email and password
3. You'll be redirected to the admin dashboard

## 📋 Verify Admin Account

To check if admin account exists:
```bash
cd server
node retrieve-credentials.js
```

This will show all users and admin accounts in the database.

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
