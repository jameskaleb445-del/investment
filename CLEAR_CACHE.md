# Clear Cache Instructions

To clear all caches and ensure fresh state:

## 1. Clear Next.js Cache (Already Done)
```powershell
Remove-Item -Recurse -Force .next
```

## 2. Clear Browser Cache

### On Mobile:
1. **Chrome/Edge (Android/iOS):**
   - Open browser settings
   - Go to Privacy/Security
   - Clear browsing data
   - Select "Cached images and files"
   - Clear data

2. **Safari (iOS):**
   - Settings → Safari
   - Clear History and Website Data

3. **Quick Clear for Testing:**
   - Open in incognito/private browsing mode
   - Or uninstall and reinstall the app (if PWA)

### On Desktop:
- **Chrome/Edge:** Ctrl+Shift+Delete → Clear cached images and files
- **Or use DevTools:** F12 → Right-click refresh button → "Empty Cache and Hard Reload"

## 3. Clear LocalStorage/SessionStorage

In browser console (F12):
```javascript
localStorage.clear()
sessionStorage.clear()
```

## 4. Restart Dev Server

Stop current server (Ctrl+C) and restart:
```powershell
npm run dev
```

## 5. Test Google OAuth Login

After clearing cache and restarting:
1. Go to login page
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to `/setup-pin` page if PIN is not set

## 6. If Still Not Working

Check your user in database:
```sql
SELECT id, email, pin_set, registration_complete 
FROM users 
WHERE email = 'your-email@gmail.com';
```

If `pin_set = true`, update it:
```sql
UPDATE users 
SET pin_set = false, registration_complete = false 
WHERE email = 'your-email@gmail.com';
```

