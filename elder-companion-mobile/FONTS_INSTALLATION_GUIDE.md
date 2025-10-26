# Custom Fonts Installation Guide

## Current Status
The app is currently using **system font fallbacks** which provide excellent readability:
- **iOS**: System (San Francisco) - Clean, highly readable
- **Android**: Roboto - Material Design standard

## How to Add Custom Fonts (Optional Enhancement)

### Fonts Needed
- **Playfair Display Bold** - For headings (elegant serif)
- **Nunito Sans Regular/SemiBold** - For body text (friendly sans-serif)

### Installation Steps

#### 1. Download Fonts
- Playfair Display: https://fonts.google.com/specimen/Playfair+Display
- Nunito Sans: https://fonts.google.com/specimen/Nunito+Sans

Download these variants:
- `PlayfairDisplay-Bold.ttf`
- `NunitoSans-Regular.ttf`
- `NunitoSans-SemiBold.ttf`
- `NunitoSans-Bold.ttf`

#### 2. Create Assets Directory
```bash
mkdir -p elder-companion-mobile/src/assets/fonts
```

#### 3. Add Font Files
Place downloaded .ttf files in `src/assets/fonts/`

#### 4. Configure React Native
Create/update `react-native.config.js` in project root:

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts/'],
};
```

#### 5. Link Assets
```bash
npx react-native-asset
```

#### 6. iOS: Run Pod Install
```bash
cd ios && pod install && cd ..
```

#### 7. Rebuild App
```bash
# iOS
npm run ios

# Android
npm run android
```

#### 8. Verify Installation
The fonts should now work automatically since `typography.ts` is already configured with the correct font names.

### Troubleshooting

**iOS Font Names**
If fonts don't work on iOS, check the actual font name:
```bash
fc-list | grep "Playfair"
```

Update `FontFamily` in `src/styles/typography.ts` if needed.

**Android Font Names**
Android uses the filename without extension:
- `PlayfairDisplay-Bold.ttf` → `PlayfairDisplay-Bold`

**Clear Cache**
If fonts don't load:
```bash
npm start -- --reset-cache
```

### Why System Fonts Are Fine
The current system fonts (San Francisco on iOS, Roboto on Android) are:
- ✅ Highly optimized for readability
- ✅ Widely tested with elderly users
- ✅ Zero installation/maintenance
- ✅ Smaller app bundle size
- ✅ Better performance

Custom fonts are a **nice-to-have** for branding, but not critical for functionality.

## Current Typography Configuration
See `src/styles/typography.ts` - already configured for custom fonts with system fallbacks.
