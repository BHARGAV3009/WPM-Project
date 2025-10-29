# OTP Authentication - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Update Server `.env` File
```env
# Add these lines to your server/.env file
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
OTP_LENGTH=4
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
```

### 2. Get Gmail App Password
1. Go to [Gmail Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste it as `EMAIL_PASSWORD` in `.env`

### 3. Done! 🎉

## How It Works

```
User tries to login with typing pattern that doesn't match
                    ↓
        "Biometric failed, sending OTP..."
                    ↓
    User receives email with 4-digit code
                    ↓
    User enters code (has 5 minutes, max 5 attempts)
                    ↓
            Login successful! ✓
```

## Features

✅ **Automatic OTP Expiry** - 5 minutes TTL on database level
✅ **Email Delivery** - Beautiful HTML emails via Gmail
✅ **Attempt Limiting** - Max 5 wrong attempts per OTP
✅ **Real-time Timer** - Shows countdown in frontend
✅ **Spam Prevention** - Can't request new OTP if one exists
✅ **Resend Support** - Click "Resend" to get new OTP
✅ **Mobile Responsive** - Works on all devices
✅ **Error Handling** - Clear messages for all scenarios

## Testing

1. Start your app
2. Go to login page
3. Enter phone + email + password
4. Intentionally type pattern differently (biometric fail)
5. Click "Sign In"
6. Should see: "Biometric failed, sending OTP..."
7. Check your email for OTP code
8. Enter code on the OTP verification screen
9. Should login successfully!

## What Changed

### Backend Files
- `server/src/models/OTP.js` - NEW OTP data model
- `server/src/utils/emailService.js` - NEW email sender
- `server/src/utils/otpGenerator.js` - NEW OTP generator
- `server/src/routes/auth.js` - Added 2 new endpoints
- `server/package.json` - Added nodemailer

### Frontend Files  
- `client/src/app/services/auth.service.ts` - Added OTP methods
- `client/src/app/components/auth/login.component.ts` - Added OTP logic
- `client/src/app/components/auth/login.component.html` - Added OTP screen
- `client/src/app/components/auth/login.component.css` - Added OTP styles

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Body: { phoneNumber: "+1234567890", email: "user@example.com" }
Response: { success: true, expiryMinutes: 5, sessionId: "..." }
```

### Verify OTP  
```
POST /api/auth/verify-otp
Body: { phoneNumber: "+1234567890", otp: "1234" }
Response: { success: true, token: "jwt_token", user: {...} }
```

## Troubleshooting

**Emails not arriving?**
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Ensure 2-Step Verification is enabled on Gmail
- Restart server after changing .env

**OTP not working?**
- Make sure MongoDB is running
- Check server logs for errors
- Try requesting new OTP

**Timer not showing?**
- Clear browser cache
- Check browser console for errors
- Refresh page

## Need Help?

See full documentation in: `OTP_IMPLEMENTATION_GUIDE.md`

---
**Status**: ✅ Ready to Use