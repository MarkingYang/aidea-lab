# Design Map

Source: https://curated.design/inspiration/dark/

## Spacing Scale

- Base unit: 4px
- Component gaps: 8px, 12px, 16px, 24px
- Layout gaps: 32px, 48px, 64px, 96px
- Container padding: 32px desktop, 16px mobile

## Font Hierarchy

- Display: 60px / 400 / Hedvig Letters Serif
- H1: 48px / 400 / Hedvig Letters Serif
- H2: 30px / 400 / Hedvig Letters Serif
- Body: 16px / 400 / Euclid Circular A
- Label and navigation: 13px / 400 / Euclid Circular A
- Utility data: 12px / ui-monospace

## Color Palette

- Background: `#FFFFFF`
- Surface: `#F5F5F5`
- Line: `#E5E5E5`
- Primary text: `#292929`
- Muted text: `#737373`
- Rust accent: `#C54120`
- Dark background: `#141414`
- Dark surface: `#1F1F1F`
- Dark text: `#F5F5F5`

## Image Ratios

- Gallery media: 16:9

## Component Tokens

- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile
- Maximum container width: 1760px
- Grid gutter: 16px
- Radii: 6px, 8px, 12px, 16px, 999px
- Shadows: none by default; `0 1px 2px rgba(0,0,0,0.04)` only when separation is otherwise lost
- Transition: 150–300ms, `cubic-bezier(.4,0,.2,1)`

---

# Taste DNA

### Whitespace as navigation
- **Trigger**: When separating a short page introduction from a large gallery.
- **Decision**: Use 64–96px pauses and open alignment over boxed section wrappers.
- **Reason**: Readers can identify the next content layer before scanning individual items.
- **Evidence**: 96px footer padding, 32px container padding, and 16px gallery gutters.

### Typography carries identity
- **Trigger**: When the page needs character without competing with many visual examples.
- **Decision**: Pair a serif display face with a neutral sans over adding decorative backdrops.
- **Reason**: The heading remains memorable while the gallery supplies the visual variation.
- **Evidence**: Hedvig Letters Serif for display, Euclid Circular A for body, and a 60px display size.

### Accent as a scarce signal
- **Trigger**: When highlighting actions inside a grayscale interface.
- **Decision**: Reserve one rust accent for primary actions over distributing brand color across headings and cards.
- **Reason**: A rare color becomes an unambiguous cue instead of ambient decoration.
- **Evidence**: `#C54120` accent against neutral card surfaces and gray navigation controls.

### Media before containers
- **Trigger**: When presenting many peer items for comparison.
- **Decision**: Repeat 16:9 media and captions over bordered shells and layered shadows.
- **Reason**: Repeated geometry speeds comparison and leaves each item room to differ.
- **Evidence**: Four desktop columns, 16px gutters, 8px media radius, and no persistent card shadow.
