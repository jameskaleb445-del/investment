# PWA Icons Setup

Your Progressive Web App needs icon files for installation. You need to create these two icon files:

## Required Icons

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

## How to Generate Icons

### Option 1: Online Tools
- Use [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- Use [RealFaviconGenerator](https://realfavicongenerator.net/)
- Use [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

### Option 2: Create Manually
1. Design or find your app icon (should be square)
2. Export as PNG with these sizes:
   - 192x192px (for Android)
   - 512x512px (for high-res displays and splash screens)

### Option 3: Quick Placeholder (For Testing)
If you just want to test the PWA functionality quickly, you can create simple colored square images:
- Use any image editor
- Create 192x192 and 512x512 square images
- Fill with your brand color (#1a1a1f or your preferred color)
- Save as PNG in the `/public` folder

## Icon Best Practices
- Use a square image (1:1 aspect ratio)
- Make sure important elements are within the center 80% of the image (for maskable icons)
- Use high contrast for visibility on various backgrounds
- Test your icons on different devices

## Placement
Place both icon files directly in the `/public` folder:
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`

Once these files are in place, your PWA will be fully functional!










