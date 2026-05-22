<<<<<<< HEAD
# Database Credentials and User Information

## 📋 Retrieved Database Information

### Users in Database:
1. **User Account:**
   - Name: hemaprabhag.23aid
   - Email: hemaprabhag.23aid@kongu.edu
   - Role: user
   - Status: Active
   - Created: 11/14/2025
   - ID: 69166250f8aebab5d9cc46b1

### Admin Accounts:
- **No admin accounts found in the database**

### Admin Credentials from Environment:
- The admin credentials are configured in the `.env` file but were not set when the script ran
- Check `server/.env` file for:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_NAME`

## 🎯 New Features Added

### 1. Doctor Selection for Users
- **Location:** User Dashboard → Settings Page
- **Feature:** Users can now browse and select doctors from the database
- **Functionality:**
  - Search doctors by name, email, or specialization
  - View doctor profiles and specializations
  - Assign/remove doctor
  - See currently assigned doctor

### 2. User Selection for Doctors
- **Location:** Doctor Dashboard → "Manage Patients" Section
- **Feature:** Doctors can now browse and select users/patients
- **Functionality:**
  - View all available users
  - Search users by name or email
  - Assign users to themselves
  - Remove users from their patient list
  - See list of assigned patients

### 3. API Endpoints Added/Updated

#### For Users:
- `POST /api/users/assign-doctor` - Assign or remove a doctor (updated to allow null)
- `GET /api/users/doctors` - Get list of available doctors

#### For Doctors:
- `GET /api/users/all` - Get all users (doctor only)
- `POST /api/users/assign-patient` - Assign a patient to doctor
- `POST /api/users/remove-patient` - Remove a patient from doctor
- `GET /api/users/patients` - Get doctor's assigned patients

## 📝 How to Use

### For Users:
1. Go to Dashboard → Settings
2. Scroll to "Select Your Doctor" section
3. Search and select a doctor
4. Click "Select" to assign the doctor

### For Doctors:
1. Go to Doctor Dashboard
2. Scroll to "Manage Patients" section
3. Search for users
4. Click "Assign" to add them as your patients
5. View assigned patients in the "My Patients" section

## 🔧 Script to Retrieve Credentials

Run the following command to retrieve all users and admin information:
```bash
cd server
node retrieve-credentials.js
```

This script will display:
- All users in the database
- All admin accounts
- Admin credentials from environment variables
- Database summary statistics

## ⚠️ Notes

- Passwords are hashed in the database and cannot be retrieved in plain text
- Admin credentials should be set in `server/.env` file
- The admin account is created automatically on server startup if credentials are provided in `.env`

=======
# Database Credentials and User Information

## 📋 Retrieved Database Information

### Users in Database:
1. **User Account:**
   - Name: hemaprabhag.23aid
   - Email: hemaprabhag.23aid@kongu.edu
   - Role: user
   - Status: Active
   - Created: 11/14/2025
   - ID: 69166250f8aebab5d9cc46b1

### Admin Accounts:
- **No admin accounts found in the database**

### Admin Credentials from Environment:
- The admin credentials are configured in the `.env` file but were not set when the script ran
- Check `server/.env` file for:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - `ADMIN_NAME`

## 🎯 New Features Added

### 1. Doctor Selection for Users
- **Location:** User Dashboard → Settings Page
- **Feature:** Users can now browse and select doctors from the database
- **Functionality:**
  - Search doctors by name, email, or specialization
  - View doctor profiles and specializations
  - Assign/remove doctor
  - See currently assigned doctor

### 2. User Selection for Doctors
- **Location:** Doctor Dashboard → "Manage Patients" Section
- **Feature:** Doctors can now browse and select users/patients
- **Functionality:**
  - View all available users
  - Search users by name or email
  - Assign users to themselves
  - Remove users from their patient list
  - See list of assigned patients

### 3. API Endpoints Added/Updated

#### For Users:
- `POST /api/users/assign-doctor` - Assign or remove a doctor (updated to allow null)
- `GET /api/users/doctors` - Get list of available doctors

#### For Doctors:
- `GET /api/users/all` - Get all users (doctor only)
- `POST /api/users/assign-patient` - Assign a patient to doctor
- `POST /api/users/remove-patient` - Remove a patient from doctor
- `GET /api/users/patients` - Get doctor's assigned patients

## 📝 How to Use

### For Users:
1. Go to Dashboard → Settings
2. Scroll to "Select Your Doctor" section
3. Search and select a doctor
4. Click "Select" to assign the doctor

### For Doctors:
1. Go to Doctor Dashboard
2. Scroll to "Manage Patients" section
3. Search for users
4. Click "Assign" to add them as your patients
5. View assigned patients in the "My Patients" section

## 🔧 Script to Retrieve Credentials

Run the following command to retrieve all users and admin information:
```bash
cd server
node retrieve-credentials.js
```

This script will display:
- All users in the database
- All admin accounts
- Admin credentials from environment variables
- Database summary statistics

## ⚠️ Notes

- Passwords are hashed in the database and cannot be retrieved in plain text
- Admin credentials should be set in `server/.env` file
- The admin account is created automatically on server startup if credentials are provided in `.env`

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
