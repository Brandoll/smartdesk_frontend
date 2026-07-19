---
name: Monochrome Premium
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5e60'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe0'
  on-secondary-container: '#616364'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#091f21'
  on-tertiary-container: '#72888b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e3'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#d0e7ea'
  tertiary-fixed-dim: '#b4cbce'
  on-tertiary-fixed: '#091f21'
  on-tertiary-fixed-variant: '#364a4d'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  headline-xl:
    fontFamily: geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is anchored in a philosophy of **High-Contrast Minimalism**. It targets a high-end B2B SaaS audience that values precision, clarity, and executive-level sophistication. By stripping away traditional corporate blues and secondary hues, we create a focused, editorial atmosphere where content and data take center stage.

The emotional response is one of **calculated calm and technical authority**. We utilize a blend of modern minimalism and soft-edged geometric shapes to bridge the gap between "industrial precision" and "user-centric approachability." The aesthetic is raw yet refined, utilizing negative space as a functional tool rather than just a visual breather.

## Colors

The palette is strictly monochromatic, relying on the interplay of deep blacks and architectural greys to establish hierarchy.

- **Primary:** Pure Black (#000000) for high-impact typography, primary actions, and structural anchors.
- **Secondary:** A sophisticated off-white/light grey (#F4F4F5) used for background layering and surface separation.
- **Tertiary (IA Accent):** A clinical, very light cyan (#E0F7FA) used exclusively for Information Architecture cues, such as active states in navigation or subtle progress indicators, ensuring they remain distinct without breaking the monochromatic seal.
- **Neutrals:** A range of slate-toned greys facilitate subtle depth and secondary text roles, avoiding any "muddy" appearance by maintaining a cool, neutral temperature.

## Typography

The typography strategy leverages **Geist** for technical precision in headlines and UI labels, and **Manrope** for body text to maintain a modern, readable flow. 

Headlines utilize tight letter-spacing and substantial weight to create a rhythmic "anchor" on the page. Body copy is set with generous line heights to enhance legibility within data-heavy SaaS environments. Labels are often treated with slight tracking (letter-spacing) to evoke a premium, architectural feel.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. The spacing rhythm is strictly based on an 8px scale to ensure mathematical harmony.

Layouts should favor extreme asymmetric balance—large areas of white space contrasted against dense, highly organized data modules. We use "safe zones" of 48px (lg) or 80px (xl) between major sections to prevent the monochromatic palette from feeling cluttered or overwhelming.

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than traditional drop shadows. By stacking different shades of grey, we create a "sheet" metaphor that feels tactile yet digital.

- **Level 0 (Base):** White (#FFFFFF) or the lightest grey (#F4F4F5).
- **Level 1 (Cards):** A subtle contrast shift using borders or a slightly darker/lighter background tint.
- **Level 2 (Popovers/Modals):** High-contrast black outlines (1px) or very soft, ultra-diffused low-opacity shadows (e.g., 2% opacity black) to provide separation without introducing "fuzziness."
- **Backdrop Blurs:** Used sparingly for overlays to maintain a sense of context while focusing the user's attention.

## Shapes

The shape language is defined by **pronounced, modern soft-edges**. By using pill-shaped (Level 3) containers and buttons, we soften the potentially harsh nature of a high-contrast monochromatic palette.

Large containers like cards should use `rounded-xl` (3rem/48px), while interactive elements like buttons and chips utilize full pill-shaping. This creates a "smooth-to-the-touch" aesthetic that feels sophisticated and custom-engineered.

## Components

- **Buttons:** Primary buttons are solid black with white text, using a full pill-shape. Secondary buttons are outlined in 1px light grey or are entirely transparent with a subtle grey hover state.
- **Inputs:** Input fields feature a subtle 1px border (#E4E4E7) and transition to a 1px black border on focus. Backgrounds remain white to maintain high contrast for text entry.
- **Chips/Badges:** These utilize the tertiary accent (#E0F7FA) for "Active" states, or light grey for "Inactive" states, always with high-roundedness.
- **Cards:** Cards should have no shadow; instead, use a 1px border in a very light grey (#F4F4F5) or a tonal background shift to define their boundaries.
- **Lists:** Use generous vertical padding (16px+) and subtle dividers (1px, #F4F4F5). Icons should be monolinear and strictly black or mid-grey.
- **Data Tables:** High-density text with no vertical lines; use horizontal dividers only to maintain an editorial, clean-lined appearance.