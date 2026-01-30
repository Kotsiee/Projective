# Selected Codebase Context

> Included paths: ./apps/web/styles/themes/variables

## Project Tree (Selected)

```text
./apps/web/styles/themes/variables/
  variables/
  colour.css
  fields.css
  font.css
  ui.css
```

## File Contents

### File: apps\web\styles\themes\variables\colour.css

```css
/* #region 1. LOGIC SETTINGS */
:root {
        --lightness-delta: -8%;
        --active-delta: -12%;

        /* #region 2. BASE PALETTE (H/S/L) */
        --bg-hue: 0;
        --bg-saturation: 0%;
        --bg-lightness: 98%;

        --header-hue: 0;
        --header-saturation: 0%;
        --header-lightness: 100%;

        --card-hue: 0;
        --card-saturation: 0%;
        --card-lightness: 100%;

        --text-hue: 0;
        --text-saturation: 0%;
        --text-lightness: 10%;

        --primary-hue: 186;
        --primary-saturation: 57%;
        --primary-lightness: 36%;

        --danger-hue: 0;
        --danger-saturation: 70%;
        --danger-lightness: 55%;

        --warning-hue: 37;
        --warning-saturation: 90%;
        --warning-lightness: 45%;

        --success-hue: 160;
        --success-saturation: 65%;
        --success-lightness: 40%;
        /* #endregion */

        /* #region 3. GENERATED COLORS */
        --bg: hsl(var(--bg-hue), var(--bg-saturation), var(--bg-lightness));
        --header: hsl(var(--header-hue), var(--header-saturation), var(--header-lightness));
        --card: hsl(var(--card-hue), var(--card-saturation), var(--card-lightness));

        --primary: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
        --primary-hover: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + var(--lightness-delta)));
        --primary-active: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + var(--active-delta)));
        --primary-surface: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.12);

        --danger: hsl(var(--danger-hue), var(--danger-saturation), var(--danger-lightness));
        --warning: hsl(var(--warning-hue), var(--warning-saturation), var(--warning-lightness));
        --success: hsl(var(--success-hue), var(--success-saturation), var(--success-lightness));
        /* #endregion */

        /* #region 4. GLOBAL SEMANTICS */
        --text-main: hsl(var(--text-hue), var(--text-saturation), var(--text-lightness));
        --text-muted: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.6);
        --text-disabled: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.35);
        --text-tertiary: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.35);
        --border-color: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.15);

        --focus-ring: 0 0 0 3px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.4);

        --incomplete: var(--danger);
        --in-progress: var(--warning);
        --complete: var(--primary);
        /* #endregion */
}

:root[data-theme="dark"] {
        --lightness-delta: 8%;
        --active-delta: 12%;

        --bg-lightness: 10%;
        --header-lightness: 8%;
        --card-lightness: 13%;
        --text-lightness: 100%;

        --danger-lightness: 55%;
        --warning-lightness: 50%;
        --success-lightness: 45%;

        --scrollbar-bg: hsl(var(--bg-hue), var(--bg-saturation), 10%);
        --scrollbar-thumb: hsl(var(--bg-hue), var(--bg-saturation), 18%);
}

/* #endregion */
```

### File: apps\web\styles\themes\variables\fields.css

```css
/* #region FIELD COMPONENT MAPPINGS */
:root {
    /* Move form-specific structural colors here */
    --input-bg: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.05);
    --disabled-bg: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.10);

    /* Backgrounds */
    --field-bg: var(--card);
    --field-bg-hover: var(--input-bg);
    --field-bg-disabled: var(--disabled-bg);
    --field-bg-active: var(--card);

    /* Borders */
    --field-border: var(--border-color);
    --field-border-hover: var(--text-muted);
    --field-border-focus: var(--primary);
    --field-border-error: var(--danger);
    --field-border-disabled: var(--border-color);

    /* Text */
    --field-text: var(--text-main);
    --field-text-placeholder: var(--text-muted);
    --field-text-label: var(--text-main);
    --field-text-disabled: var(--text-disabled);
    --field-text-error: var(--danger);

    /* Geometry & Transition (Mapped from ui.css) */
    --field-height: var(--input-height);
    --field-padding-x: var(--input-padding-x);
    --field-radius: var(--border-radius);
    --field-transition: var(--fast) cubic-bezier(0.4, 0, 0.2, 1);

    /* Effects */
    --field-ring-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.15);
    --field-ripple-color: var(--primary-surface);
}

:root[data-theme="dark"] {
    /* Higher contrast structural colors for dark mode */
    --input-bg: hsla(var(--text-hue), var(--text-saturation), var(--text-lightness), 0.08);
    --field-bg: hsl(var(--bg-hue), var(--bg-saturation), 12%);
    --field-ring-color: hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.25);
}

/* #endregion */
```

### File: apps\web\styles\themes\variables\font.css

```css
:root {
    --font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
        "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
    --font-dyslexia: "OpenDyslexic", Atkinson, var(--font-sans);

    font-size: 14px;
}
```

### File: apps\web\styles\themes\variables\ui.css

```css
:root {
    --scale: 1;

    --header-height: 4rem;
    --side-nav-width: 0rem;

    --border-radius__xsmall: 4px;
    --border-radius__small: 0.375rem;
    --border-radius: 8px;
    --border-radius__large: 12px;
    --border-radius__xlarge: 16px;

    --fast: 150ms;
    --medium: 250ms;
    --slow: 350ms;

    background-color: var(--bg);
    color: var(--text-main);
    font-family: var(--font-sans);


    --input-height: 2.5rem;
    --input-padding-x: 0.75rem;



    &:has([data-sidebar-open='false']) {
        --side-nav-width: 4rem;

    }

    &:has([data-sidebar-open='true']) {
        --side-nav-width: 14rem;
    }
}
```

