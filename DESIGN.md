# Design System Specification: SonicView High-End Glassmorphism

## 1. Overview & Creative North Star
**Creative North Star: "The Obsidian Lens"**
This design system moves beyond standard "dark mode" into a realm of deep, atmospheric immersion. It is designed to feel like a high-end physical audio component—machined, polished, and luminous. By leveraging heavy background blurs and intentional tonal shifts, we create an interface that feels less like a flat screen and more like a series of illuminated glass panels floating in a void.

The system rejects the "boxed-in" look of traditional SaaS products. Instead, it uses **Intentional Asymmetry** and **Overlapping Volumes** to create a sense of motion. Hero elements should bleed off-edge or overlap container boundaries, breaking the rigid grid to suggest the fluid nature of sound.

---

## 2. Colors & Surface Philosophy
The palette is built on "Obsidian Depth," using deep charcoals to provide the canvas for vibrant, neon-infused accents.

### Palette Highlights
- **Primary (Electric Green):** `#00fc43` (Token: `primary`) for high-visibility actions.
- **Secondary (Dark Green):** `#0a8a22` (Token: `secondary`) for energetic accents and mood-based UI.
- **Tertiary (Warm Orange):** `#ffd5ac` (Token: `tertiary`) for highlights and decorative elements.
- **Neutral (Slate Green):** `#6f7a6a` (Token: `neutral`) for backgrounds, surfaces, and non-chromatic elements.

### The "No-Line" Rule & Surface Hierarchy
Traditional dividers are strictly prohibited. Separation must be achieved through:
- **Tonal Transitions:** Use `surface_container_low` (#1C1B1B) against `surface` (#131313) to define distinct regions like sidebars or players.
- **Glass Nesting:** When placing a card inside a container, use a `surface_container_high` (#2A2A2A) with a `backdrop-filter: blur(20px)` and 40% opacity. This creates a "nested" depth that feels like stacked sheets of optical glass.

### The "Glass & Gradient" Rule
Main Call-to-Actions (CTAs) must not be flat. Use a linear gradient from `primary` to `primary_container` (#00fc43) at a 135-degree angle. For a "signature" feel, apply a subtle 2px inner glow (white at 10% opacity) to the top edge of glass components to simulate light catching the rim of the glass.

---

## 3. Typography
We utilize **Inter** for its mathematical precision and high legibility against dark, glowing backgrounds.

- **Display (The Editorial Hook):** `display-lg` (3.5rem) should be used for artist names or featured track titles. Use tight letter-spacing (-0.02em) to create a bold, "poster" aesthetic.
- **Headlines (The Navigator):** `headline-md` (1.75rem) serves as the primary anchor for library sections.
- **The Hierarchy Logic:** To maintain a premium editorial feel, contrast high-weight `headline-lg` text with `label-sm` (0.6875rem) in all-caps with increased letter-spacing (+0.1em) for metadata like "RELEASE DATE" or "GENRE."

---

## 4. Elevation & Depth
In this system, elevation is a measurement of **light and translucency**, not just shadows.

- **The Layering Principle:**
1. **Base:** `surface_container_lowest` (#0E0E0E) - The background void.
2. **Middle:** `surface_container` (#201F1F) - Standard content areas.
3. **Top:** `surface_bright` (#3A3939) - Floating glass cards and modals.
- **Ambient Shadows:** Shadows are rare. When used for high-priority modals, use a large blur (40px) with the color `primary` at 5% opacity. This creates a "backlight" effect rather than a traditional drop shadow.
- **The "Ghost Border":** For accessibility on interactive elements, use `outline_variant` (#3C494E) at **15% opacity**. This provides a 1px "catch-light" on the edge of cards without creating a hard structural line.

---

## 5. Components

### Glassmorphic Cards
- **Construction:** Background color `surface_container_high` at 40% opacity + `backdrop-filter: blur(24px)`.
- **Border:** 1px "Ghost Border" using `outline_variant` at 20% opacity.
- **Content:** No dividers. Use **Spacing 2** (equivalent to "Normal" spacing) to separate internal elements.

### Translucent Buttons
- **Primary:** Gradient (`primary` to `primary_container`), 0% border, `on_primary` text.
- **Secondary (Glass):** Transparent background with `backdrop-filter: blur(10px)`. 1px Ghost Border.
- **States:** On hover, increase the `backdrop-filter` density and add a `primary` outer glow (blur 12px, 20% opacity).

### Fluid Progress Bars
- **Track:** `surface_container_highest` (#353534) at 50% opacity.
- **Indicator:** A gradient from `primary` to `secondary`.
- **The "Pulse":** The playhead should be a `secondary_fixed` (#F8D8FF) circle with a 10px outer glow of the same color.

### Glowing Icons
- **Style:** Lucide-inspired (2px stroke).
- **Treatment:** Active icons should inherit the `primary` color and utilize a subtle CSS `filter: drop-shadow(0 0 4px #00ff4cff)`.

### Inputs & Search
- **Style:** `surface_container_low` background, rounded `xl` (1.5rem).
- **Interaction:** On focus, the border transitions from 0% opacity to 30% `primary` color, and the background blurs the content beneath it.

---

## 6. Do's and Don'ts

### Do
- **Do** use negative space (Spacing 8 or 10) to let high-quality artist imagery "breathe."
- **Do** use `primary_fixed_dim` for secondary text to maintain a cohesive blue-tinted dark theme.
- **Do** overlap album art over container edges to create a 3D "layered" effect.

### Don't
- **Don't** use 100% white (#FFFFFF) for body text. Use `on_surface` (#E5E2E1) to reduce eye strain and maintain the atmospheric tone.
- **Don't** use sharp corners. Use `md` (0.75rem) as the minimum radius for any container; music is fluid, the UI should be too.
- **Don't** use standard grey shadows. If a shadow is needed, tint it with the `primary` or `surface_tint` tokens.
- **Don't** use dividers. If you feel the need for a line, increase the spacing by one increment on the scale instead.