# Safari icon corner fix

- Updated `icons/build_icons.py` so favicon, Apple Touch, and PWA PNG outputs retain the rounded alpha mask.
- Regenerated `apple-touch-icon.png`, `icon-192.png`, and `icon-512.png`; existing favicon PNG/ICO dimensions and MIME formats remain unchanged.
- Bumped icon URL cache token from `brand-160` to `brand-161` in `index.html`.
- Verified all PNG output dimensions and all four corner alpha values are `0`; ICO still contains 16/32/48 frames.
- The page logo remains the existing inline `brand-logo` and `icons/purplebrand.svg`; neither was changed.
