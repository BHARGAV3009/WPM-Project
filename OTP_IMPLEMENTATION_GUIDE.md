# OTP Authentication Implementation Guide

## Overview
This implementation adds a fallback OTP (One-Time Password) authentication system for when biometric (typing pattern) authentication fails. The OTP is sent to the user's registered email address.

## Features Implemented

### Backend (Server)

#### 1. **OTP Model** (`server/src/models/OTP.js`)
- Stores OTP records with user ID, email, OTP code, and timestamps
- Automatic TTL (Time To Live) of 5 minutes - records auto-delete after expiry
- Tracks verification status and login attempts
- Maximum 5 failed attempts before OTP is invalidated

#### 2. **Email Service** (`server/src/utils/emailService.js`)
- Sends OTP emails via Gmail SMTP
- Beautiful HTML email template with branding
- Includes security warnings and usage instructions
- Verifies email transporter connection on startup

#### 3. **OTP Generator Utility** (`server/src/utils/otpGenerator.js`)
- Generates cryptographically secure 4-digit OTPs
- OTP expiry validation with configurable timeout
- Calculates remaining time for display purposes
- Formats remaining time in MM:SS format

#### 4. **Authentication Routes** (`server/src/routes/auth.js`)
Added two new endpoints:

**POST `/api/auth/send-otp`**
- Parameters: `phoneNumber`, `email`
- Validates user exists and email matches records
- Checks for existing unexpired OTP to prevent spam
- Generates and stores new OTP in database
- Sends OTP email to user
- Returns: OTP session ID and expiry time
- Response includes remaining time if OTP already sent

**POST `/api/auth/verify-otp`**
- Parameters: `phoneNumber`, `otp`
- Validates OTP exists and is not expired
- Checks attempt limits (max 5 wrong attempts)
- Verifies entered OTP against stored value
- On success: Marks OTP as verified and generates JWT token
- On failure: Returns remaining attempts count
- Returns: Login token and user data on success

### Frontend (Client)

#### 1. **Auth Service Update** (`client/src/app/services/auth.service.ts`)
Added two new methods:
- `sendOTP(phoneNumber, email)`: Sends OTP request to backend
- `verifyOTP(phoneNumber, otp)`: Verifies entered OTP and completes login

#### 2. **Login Component Enhancement** (`client/src/app/components/auth/login.component.ts`)
- Added `otpForm` FormGroup for OTP input validation
- Added state management for OTP screen visibility
- Implements OTP countdown timer (5 minutes)
- Tracks remaining attempts
- Auto-detects biometric failure and triggers OTP flow
- Handles OTP verification and token storage

Key methods:
- `sendOTP()`: Requests OTP for user
- `verifyOTP()`: Submits OTP for verification
- `startOTPTimer()`: Starts 5-minute countdown
- `goBackToLogin()`: Returns to login form
- `getFormattedTime()`: Formats remaining time

#### 3. **Login Template Update** (`client/src/app/components/auth/login.component.html`)
- Added email input field (required for OTP)
- New OTP verification screen with:
  - Back button to return to login
  - OTP input field (4-digit validation)
  - Real-time countdown timer
  - Remaining attempts display
  - Resend OTP link
  - Smooth transitions between screens

#### 4. **Login Styling** (`client/src/app/components/auth/login.component.css`)
- OTP screen styling with glassmorphism effect
- Responsive design for mobile/tablet/desktop
- Timer and attempts display styling
- Smooth animations and transitions
- Input focus states and error styling
- Mobile-optimized layout

## Setup Instructions

### 1. Environment Configuration

Update your `.env` file in the server directory with:

```env
# Existing variables
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chatsapp
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:4200
PHONE_HASH_SALT=your_phone_hash_salt_here

# New Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# OTP Configuration
OTP_LENGTH=4
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
```

### 2. Gmail Configuration

To use Gmail for sending OTPs:

1. **Enable 2-Step Verification** on your Gmail account
   - Go to https://myaccount.google.com/
   - Click "Security" in the left sidebar
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password to `EMAIL_PASSWORD` in `.env`

3. **Alternative: Use Less Secure Apps**
   - Enable "Less secure app access" at https://myaccount.google.com/lesssecureapps
   - Use your regular Gmail password in `.env`

### 3. Install Dependencies

Run in the server directory:
```bash
npm install
```

This installs `nodemailer@^6.9.7` package.

### 4. Database Setup

No additional database migrations needed. MongoDB will automatically create the OTP collection on first use.

## Authentication Flow

### Biometric Authentication Failed → OTP Login

```
User Login Attempt
    ↓
[Step 1] Submit phone + password + typing pattern
    ↓
Biometric Check
    ├─ Success → Login complete ✓
    └─ Fail → Show OTP request message
        ↓
[Step 2] Request OTP
    ↓
Server validates user & email
    ├─ Valid → Generate & send OTP via email
    │   └─ User receives email with OTP code
    └─ Invalid → Show error
        ↓
[Step 3] Enter 4-digit OTP
    ↓
Verify OTP (within 5 minutes, max 5 attempts)
    ├─ Success → Login complete ✓
    ├─ Incorrect → Show remaining attempts
    ├─ Max attempts exceeded → Request new OTP
    └─ Expired → Request new OTP
```

## Key Implementation Details

### OTP Lifecycle

1. **Generation**: Secure random 4-digit number generated
2. **Storage**: Saved to MongoDB with automatic 5-minute TTL
3. **Transmission**: Sent via Gmail SMTP with HTML template
4. **Verification**: User submits within 5 minutes (max 5 attempts)
5. **Cleanup**: Auto-deleted after 5 minutes or verification

### Security Features

- **Email Verification**: OTP sent to registered email ensures access
- **Time Limit**: 5-minute expiry prevents long-term attack window
- **Attempt Limit**: Maximum 5 wrong attempts per OTP
- **Rate Limiting**: Existing OTP prevents spam requests
- **Secure Generation**: Cryptographically secure random number generation
- **Database**: OTP stored in database (never in local storage)

### Error Handling

Frontend handles:
- Network errors
- Expired OTPs
- Invalid OTPs
- Maximum attempts exceeded
- Email sending failures

Backend handles:
- Invalid user/email combinations
- Expired OTPs
- Attempt limit violations
- Database errors
- Email service failures

## Testing

### Manual Testing Checklist

1. **OTP Sending**
   - [ ] Login with correct password but different typing pattern
   - [ ] Should trigger OTP request
   - [ ] Email should arrive within 10 seconds
   - [ ] OTP code visible in email

2. **OTP Verification**
   - [ ] Enter correct OTP → Login success
   - [ ] Enter wrong OTP 5 times → "Max attempts exceeded"
   - [ ] Wait 5 minutes → "OTP expired"
   - [ ] Click "Resend" → New OTP sent

3. **UI/UX**
   - [ ] Countdown timer displays correctly
   - [ ] Attempts counter updates on wrong entry
   - [ ] Back button returns to login form
   - [ ] All fields show proper error messages
   - [ ] Mobile layout responsive

## API Response Examples

### Send OTP - Success
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "sessionId": "507f1f77bcf86cd799439011",
  "expiryMinutes": 5
}
```

### Send OTP - Already Sent
```json
{
  "success": true,
  "message": "OTP already sent. Please check your email.",
  "remainingTime": 280,
  "formattedTime": "4:40"
}
```

### Verify OTP - Success
```json
{
  "success": true,
  "message": "OTP verified successfully. Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "profilePicture": "default-profile.png",
    "status": "Hey there! I am using ChatsApp",
    "publicKey": "..."
  }
}
```

### Verify OTP - Wrong OTP
```json
{
  "success": false,
  "message": "Incorrect OTP. 3 attempts remaining.",
  "attemptsRemaining": 3
}
```

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   ```bash
   echo $env:EMAIL_USER
   echo $env:EMAIL_PASSWORD
   ```

2. **Verify Gmail Settings**
   - 2-Step Verification is enabled
   - App password is correctly generated
   - Less secure apps enabled (if using regular password)

3. **Check Server Logs**
   ```
   nodemon src/server.js
   Look for: "Email transporter ready" or "Email transporter error"
   ```

### OTP Not Expiring

- Check MongoDB TTL index was created
- Verify `createdAt` field has `expires: 300`
- MongoDB TTL index requires system clock sync

### Biometric Detection Issues

- Clear browser cache and local storage
- Ensure typing pattern is being recorded
- Check TypingBiometricService is working

## Files Changed

### Backend
- ✓ `server/src/models/OTP.js` - NEW
- ✓ `server/src/utils/emailService.js` - NEW
- ✓ `server/src/utils/otpGenerator.js` - NEW
- ✓ `server/src/routes/auth.js` - MODIFIED
- ✓ `server/package.json` - MODIFIED (added nodemailer)
- ✓ `server/.env.example` - MODIFIED

### Frontend
- ✓ `client/src/app/services/auth.service.ts` - MODIFIED
- ✓ `client/src/app/components/auth/login.component.ts` - MODIFIED
- ✓ `client/src/app/components/auth/login.component.html` - MODIFIED
- ✓ `client/src/app/components/auth/login.component.css` - MODIFIED

## Future Enhancements

1. **SMS OTP**: Add SMS delivery as alternative to email
2. **Backup Codes**: Generate backup codes for account recovery
3. **OTP History**: Log all OTP requests for security audit
4. **Rate Limiting**: Implement API rate limiting on OTP requests
5. **QR Code**: Add QR code-based 2FA using authenticator apps
6. **WebAuthn**: Support hardware security keys
7. **Email Templates**: Internationalization for multiple languages
8. **Analytics**: Track OTP usage patterns and success rates

## Support & Documentation

For more information:
- See `.zencoder/rules/repo.md` for project structure
- Check server error logs for detailed error messages
- Review email template in `emailService.js` for customization

---
**Implementation Date**: 2024
**Status**: Production Ready