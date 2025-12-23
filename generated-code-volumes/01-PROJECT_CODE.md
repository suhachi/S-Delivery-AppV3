# Project Code Volume 01

Generated: 2025-12-23 14:30:55
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 1
- Approx size: 0.08 MB

---

## File: src\index.css

```css
/*! tailwindcss v4.1.3 | MIT License | https://tailwindcss.com */
@layer properties {
  @supports (((-webkit-hyphens: none)) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {

    *,
    :before,
    :after,
    ::backdrop {
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-translate-z: 0;
      --tw-scale-x: 1;
      --tw-scale-y: 1;
      --tw-scale-z: 1;
      --tw-rotate-x: rotateX(0);
      --tw-rotate-y: rotateY(0);
      --tw-rotate-z: rotateZ(0);
      --tw-skew-x: skewX(0);
      --tw-skew-y: skewY(0);
      --tw-scroll-snap-strictness: proximity;
      --tw-space-y-reverse: 0;
      --tw-space-x-reverse: 0;
      --tw-border-style: solid;
      --tw-gradient-position: initial;
      --tw-gradient-from: #0000;
      --tw-gradient-via: #0000;
      --tw-gradient-to: #0000;
      --tw-gradient-stops: initial;
      --tw-gradient-via-stops: initial;
      --tw-gradient-from-position: 0%;
      --tw-gradient-via-position: 50%;
      --tw-gradient-to-position: 100%;
      --tw-leading: initial;
      --tw-font-weight: initial;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-color: initial;
      --tw-shadow-alpha: 100%;
      --tw-inset-shadow: 0 0 #0000;
      --tw-inset-shadow-color: initial;
      --tw-inset-shadow-alpha: 100%;
      --tw-ring-color: initial;
      --tw-ring-shadow: 0 0 #0000;
      --tw-inset-ring-color: initial;
      --tw-inset-ring-shadow: 0 0 #0000;
      --tw-ring-inset: initial;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-outline-style: solid;
      --tw-blur: initial;
      --tw-brightness: initial;
      --tw-contrast: initial;
      --tw-grayscale: initial;
      --tw-hue-rotate: initial;
      --tw-invert: initial;
      --tw-opacity: initial;
      --tw-saturate: initial;
      --tw-sepia: initial;
      --tw-drop-shadow: initial;
      --tw-drop-shadow-color: initial;
      --tw-drop-shadow-alpha: 100%;
      --tw-drop-shadow-size: initial;
      --tw-backdrop-blur: initial;
      --tw-backdrop-brightness: initial;
      --tw-backdrop-contrast: initial;
      --tw-backdrop-grayscale: initial;
      --tw-backdrop-hue-rotate: initial;
      --tw-backdrop-invert: initial;
      --tw-backdrop-opacity: initial;
      --tw-backdrop-saturate: initial;
      --tw-backdrop-sepia: initial;
      --tw-duration: initial;
    }
  }
}

@layer theme {

  :root,
  :host {
    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --color-red-50: oklch(.971 .013 17.38);
    --color-red-100: oklch(.936 .032 17.717);
    --color-red-500: oklch(.637 .237 25.331);
    --color-red-600: oklch(.577 .245 27.325);
    --color-red-700: oklch(.505 .213 27.518);
    --color-orange-50: oklch(.98 .016 73.684);
    --color-orange-100: oklch(.954 .038 75.164);
    --color-orange-200: oklch(.901 .076 70.697);
    --color-orange-300: oklch(.837 .128 66.29);
    --color-orange-500: oklch(.705 .213 47.604);
    --color-orange-600: oklch(.646 .222 41.116);
    --color-orange-700: oklch(.553 .195 38.402);
    --color-orange-900: oklch(.408 .123 38.172);
    --color-yellow-50: oklch(.987 .026 102.212);
    --color-yellow-100: oklch(.973 .071 103.193);
    --color-yellow-200: oklch(.945 .129 101.54);
    --color-yellow-400: oklch(.852 .199 91.936);
    --color-yellow-600: oklch(.681 .162 75.834);
    --color-yellow-700: oklch(.554 .135 66.442);
    --color-green-50: oklch(.982 .018 155.826);
    --color-green-100: oklch(.962 .044 156.743);
    --color-green-200: oklch(.925 .084 155.995);
    --color-green-500: oklch(.723 .219 149.579);
    --color-green-600: oklch(.627 .194 149.214);
    --color-green-700: oklch(.527 .154 150.069);
    --color-green-800: oklch(.448 .119 151.328);
    --color-blue-50: oklch(.97 .014 254.604);
    --color-blue-100: oklch(.932 .032 255.585);
    --color-blue-200: oklch(.882 .059 254.128);
    --color-blue-500: oklch(.623 .214 259.815);
    --color-blue-600: oklch(.546 .245 262.881);
    --color-blue-700: oklch(.488 .243 264.376);
    --color-blue-800: oklch(.424 .199 265.638);
    --color-blue-900: oklch(.379 .146 265.522);
    --color-purple-100: oklch(.946 .033 307.174);
    --color-purple-500: oklch(.627 .265 303.9);
    --color-purple-600: oklch(.558 .288 302.321);
    --color-purple-700: oklch(.496 .265 301.924);
    --color-gray-50: oklch(.985 .002 247.839);
    --color-gray-100: oklch(.967 .003 264.542);
    --color-gray-200: oklch(.928 .006 264.531);
    --color-gray-300: oklch(.872 .01 258.338);
    --color-gray-400: oklch(.707 .022 261.325);
    --color-gray-500: oklch(.551 .027 264.364);
    --color-gray-600: oklch(.446 .03 256.802);
    --color-gray-700: oklch(.373 .034 259.733);
    --color-gray-800: oklch(.278 .033 256.848);
    --color-gray-900: oklch(.21 .034 264.665);
    --color-black: #000;
    --color-white: #fff;
    --spacing: .25rem;
    --container-md: 28rem;
    --container-lg: 32rem;
    --container-2xl: 42rem;
    --container-3xl: 48rem;
    --container-4xl: 56rem;
    --container-7xl: 80rem;
    --text-xs: .75rem;
    --text-xs--line-height: calc(1 / .75);
    --text-sm: .875rem;
    --text-sm--line-height: calc(1.25 / .875);
    --text-base: 1rem;
    --text-base--line-height: calc(1.5 / 1);
    --text-lg: 1.125rem;
    --text-lg--line-height: calc(1.75 / 1.125);
    --text-xl: 1.25rem;
    --text-xl--line-height: calc(1.75 / 1.25);
    --text-2xl: 1.5rem;
    --text-2xl--line-height: calc(2 / 1.5);
    --text-3xl: 1.875rem;
    --text-3xl--line-height: calc(2.25 / 1.875);
    --text-4xl: 2.25rem;
    --text-4xl--line-height: calc(2.5 / 2.25);
    --text-5xl: 3rem;
    --text-5xl--line-height: 1;
    --text-6xl: 3.75rem;
    --text-6xl--line-height: 1;
    --text-7xl: 4.5rem;
    --text-7xl--line-height: 1;
    --text-8xl: 6rem;
    --text-8xl--line-height: 1;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --leading-tight: 1.25;
    --leading-relaxed: 1.625;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --shadow-lg: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
    --drop-shadow-lg: 0 4px 4px #00000026;
    --animate-spin: spin 1s linear infinite;
    --animate-pulse: pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
    --blur-sm: 8px;
    --default-transition-duration: .15s;
    --default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    --default-font-family: var(--font-sans);
    --default-font-feature-settings: var(--font-sans--font-feature-settings);
    --default-font-variation-settings: var(--font-sans--font-variation-settings);
    --default-mono-font-family: var(--font-mono);
    --default-mono-font-feature-settings: var(--font-mono--font-feature-settings);
    --default-mono-font-variation-settings: var(--font-mono--font-variation-settings);
  }
}

@layer base {

  *,
  :after,
  :before,
  ::backdrop {
    box-sizing: border-box;
    border: 0 solid;
    margin: 0;
    padding: 0;
  }

  ::file-selector-button {
    box-sizing: border-box;
    border: 0 solid;
    margin: 0;
    padding: 0;
  }

  html,
  :host {
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    line-height: 1.5;
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var(--default-font-variation-settings, normal);
    -webkit-tap-highlight-color: transparent;
  }

  body {
    line-height: inherit;
  }

  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }

  abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  a {
    color: inherit;
    -webkit-text-decoration: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }

  b,
  strong {
    font-weight: bolder;
  }

  code,
  kbd,
  samp,
  pre {
    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
    font-feature-settings: var(--default-mono-font-feature-settings, normal);
    font-variation-settings: var(--default-mono-font-variation-settings, normal);
    font-size: 1em;
  }

  small {
    font-size: 80%;
  }

  sub,
  sup {
    vertical-align: baseline;
    font-size: 75%;
    line-height: 0;
    position: relative;
  }

  sub {
    bottom: -.25em;
  }

  sup {
    top: -.5em;
  }

  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }

  :-moz-focusring {
    outline: auto;
  }

  progress {
    vertical-align: baseline;
  }

  summary {
    display: list-item;
  }

  ol,
  ul,
  menu {
    list-style: none;
  }

  img,
  svg,
  video,
  canvas,
  audio,
  iframe,
  embed,
  object {
    vertical-align: middle;
    display: block;
  }

  img,
  video {
    max-width: 100%;
    height: auto;
  }

  button,
  input,
  select,
  optgroup,
  textarea {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    opacity: 1;
    background-color: #0000;
    border-radius: 0;
  }

  ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    opacity: 1;
    background-color: #0000;
    border-radius: 0;
  }

  :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }

  :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }

  ::file-selector-button {
    margin-inline-end: 4px;
  }

  ::placeholder {
    opacity: 1;
    color: currentColor;
  }

  @supports (color: color-mix(in lab, red, red)) {
    ::placeholder {
      color: color-mix(in oklab, currentColor 50%, transparent);
    }
  }

  textarea {
    resize: vertical;
  }

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }

  ::-webkit-datetime-edit {
    display: inline-flex;
  }

  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  ::-webkit-datetime-edit {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-year-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-month-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-day-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-hour-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-minute-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-second-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-millisecond-field {
    padding-block: 0;
  }

  ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }

  :-moz-ui-invalid {
    box-shadow: none;
  }

  button,
  input:where([type="button"], [type="reset"], [type="submit"]) {
    appearance: button;
  }

  ::file-selector-button {
    appearance: button;
  }

  ::-webkit-inner-spin-button {
    height: auto;
  }

  ::-webkit-outer-spin-button {
    height: auto;
  }

  [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }

  * {
    border-color: oklch(.922 0 0);
    outline-color: color-mix(in oklab, oklch(.708 0 0) 50%, transparent);
  }

  body {
    background-color: oklch(1 0 0);
    color: oklch(.145 0 0);
  }
}

@layer utilities {
  .pointer-events-none {
    pointer-events: none;
  }

  .absolute {
    position: absolute;
  }

  .fixed {
    position: fixed;
  }

  .relative {
    position: relative;
  }

  .sticky {
    position: sticky;
  }

  .inset-0 {
    inset: calc(var(--spacing) * 0);
  }

  .-top-1 {
    top: calc(var(--spacing) * -1);
  }

  .top-0 {
    top: calc(var(--spacing) * 0);
  }

  .top-1\/2 {
    top: 50%;
  }

  .top-3 {
    top: calc(var(--spacing) * 3);
  }

  .top-4 {
    top: calc(var(--spacing) * 4);
  }

  .top-5 {
    top: calc(var(--spacing) * 5);
  }

  .top-16 {
    top: calc(var(--spacing) * 16);
  }

  .top-24 {
    top: calc(var(--spacing) * 24);
  }

  .top-full {
    top: 100%;
  }

  .-right-1 {
    right: calc(var(--spacing) * -1);
  }

  .right-0 {
    right: calc(var(--spacing) * 0);
  }

  .right-4 {
    right: calc(var(--spacing) * 4);
  }

  .bottom-0 {
    bottom: calc(var(--spacing) * 0);
  }

  .bottom-4 {
    bottom: calc(var(--spacing) * 4);
  }

  .left-0 {
    left: calc(var(--spacing) * 0);
  }

  .left-1\/2 {
    left: 50%;
  }

  .left-3 {
    left: calc(var(--spacing) * 3);
  }

  .left-4 {
    left: calc(var(--spacing) * 4);
  }

  .-z-10 {
    z-index: calc(10 * -1);
  }

  .z-10 {
    z-index: 10;
  }

  .z-40 {
    z-index: 40;
  }

  .z-50 {
    z-index: 50;
  }

  .order-1 {
    order: 1;
  }

  .order-2 {
    order: 2;
  }

  .order-3 {
    order: 3;
  }

  .container {
    width: 100%;
  }

  @media (width >=40rem) {
    .container {
      max-width: 40rem;
    }
  }

  @media (width >=48rem) {
    .container {
      max-width: 48rem;
    }
  }

  @media (width >=64rem) {
    .container {
      max-width: 64rem;
    }
  }

  @media (width >=80rem) {
    .container {
      max-width: 80rem;
    }
  }

  @media (width >=96rem) {
    .container {
      max-width: 96rem;
    }
  }

  .-m-1 {
    margin: calc(var(--spacing) * -1);
  }

  .mx-2 {
    margin-inline: calc(var(--spacing) * 2);
  }

  .mx-auto {
    margin-inline: auto;
  }

  .-mt-6 {
    margin-top: calc(var(--spacing) * -6);
  }

  .mt-0\.5 {
    margin-top: calc(var(--spacing) * .5);
  }

  .mt-1 {
    margin-top: calc(var(--spacing) * 1);
  }

  .mt-1\.5 {
    margin-top: calc(var(--spacing) * 1.5);
  }

  .mt-2 {
    margin-top: calc(var(--spacing) * 2);
  }

  .mt-3 {
    margin-top: calc(var(--spacing) * 3);
  }

  .mt-4 {
    margin-top: calc(var(--spacing) * 4);
  }

  .mt-5 {
    margin-top: calc(var(--spacing) * 5);
  }

  .mt-6 {
    margin-top: calc(var(--spacing) * 6);
  }

  .mt-8 {
    margin-top: calc(var(--spacing) * 8);
  }

  .mt-auto {
    margin-top: auto;
  }

  .mr-1 {
    margin-right: calc(var(--spacing) * 1);
  }

  .mr-1\.5 {
    margin-right: calc(var(--spacing) * 1.5);
  }

  .mr-2 {
    margin-right: calc(var(--spacing) * 2);
  }

  .mb-1 {
    margin-bottom: calc(var(--spacing) * 1);
  }

  .mb-1\.5 {
    margin-bottom: calc(var(--spacing) * 1.5);
  }

  .mb-2 {
    margin-bottom: calc(var(--spacing) * 2);
  }

  .mb-3 {
    margin-bottom: calc(var(--spacing) * 3);
  }

  .mb-4 {
    margin-bottom: calc(var(--spacing) * 4);
  }

  .mb-6 {
    margin-bottom: calc(var(--spacing) * 6);
  }

  .mb-8 {
    margin-bottom: calc(var(--spacing) * 8);
  }

  .mb-12 {
    margin-bottom: calc(var(--spacing) * 12);
  }

  .ml-1 {
    margin-left: calc(var(--spacing) * 1);
  }

  .ml-2 {
    margin-left: calc(var(--spacing) * 2);
  }

  .ml-4 {
    margin-left: calc(var(--spacing) * 4);
  }

  .line-clamp-1 {
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }

  .line-clamp-2 {
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
  }

  .block {
    display: block;
  }

  .flex {
    display: flex;
  }

  .grid {
    display: grid;
  }

  .hidden {
    display: none;
  }

  .inline-block {
    display: inline-block;
  }

  .inline-flex {
    display: inline-flex;
  }

  .aspect-\[4\/3\] {
    aspect-ratio: 4 / 3;
  }

  .aspect-\[16\/9\] {
    aspect-ratio: 16 / 9;
  }

  .h-1 {
    height: calc(var(--spacing) * 1);
  }

  .h-2 {
    height: calc(var(--spacing) * 2);
  }

  .h-3 {
    height: calc(var(--spacing) * 3);
  }

  .h-4 {
    height: calc(var(--spacing) * 4);
  }

  .h-5 {
    height: calc(var(--spacing) * 5);
  }

  .h-6 {
    height: calc(var(--spacing) * 6);
  }

  .h-7 {
    height: calc(var(--spacing) * 7);
  }

  .h-8 {
    height: calc(var(--spacing) * 8);
  }

  .h-10 {
    height: calc(var(--spacing) * 10);
  }

  .h-12 {
    height: calc(var(--spacing) * 12);
  }

  .h-14 {
    height: calc(var(--spacing) * 14);
  }

  .h-16 {
    height: calc(var(--spacing) * 16);
  }

  .h-20 {
    height: calc(var(--spacing) * 20);
  }

  .h-24 {
    height: calc(var(--spacing) * 24);
  }

  .h-32 {
    height: calc(var(--spacing) * 32);
  }

  .h-48 {
    height: calc(var(--spacing) * 48);
  }

  .h-full {
    height: 100%;
  }

  .max-h-48 {
    max-height: calc(var(--spacing) * 48);
  }

  .max-h-80 {
    max-height: calc(var(--spacing) * 80);
  }

  .max-h-\[90vh\] {
    max-height: 90vh;
  }

  .min-h-screen {
    min-height: 100vh;
  }

  .w-2 {
    width: calc(var(--spacing) * 2);
  }

  .w-3 {
    width: calc(var(--spacing) * 3);
  }

  .w-4 {
    width: calc(var(--spacing) * 4);
  }

  .w-5 {
    width: calc(var(--spacing) * 5);
  }

  .w-6 {
    width: calc(var(--spacing) * 6);
  }

  .w-7 {
    width: calc(var(--spacing) * 7);
  }

  .w-8 {
    width: calc(var(--spacing) * 8);
  }

  .w-10 {
    width: calc(var(--spacing) * 10);
  }

  .w-11 {
    width: calc(var(--spacing) * 11);
  }

  .w-12 {
    width: calc(var(--spacing) * 12);
  }

  .w-14 {
    width: calc(var(--spacing) * 14);
  }

  .w-16 {
    width: calc(var(--spacing) * 16);
  }

  .w-20 {
    width: calc(var(--spacing) * 20);
  }

  .w-24 {
    width: calc(var(--spacing) * 24);
  }

  .w-32 {
    width: calc(var(--spacing) * 32);
  }

  .w-64 {
    width: calc(var(--spacing) * 64);
  }

  .w-\[280px\] {
    width: 280px;
  }

  .w-full {
    width: 100%;
  }

  .max-w-2xl {
    max-width: var(--container-2xl);
  }

  .max-w-3xl {
    max-width: var(--container-3xl);
  }

  .max-w-4xl {
    max-width: var(--container-4xl);
  }

  .max-w-7xl {
    max-width: var(--container-7xl);
  }

  .max-w-lg {
    max-width: var(--container-lg);
  }

  .max-w-md {
    max-width: var(--container-md);
  }

  .min-w-0 {
    min-width: calc(var(--spacing) * 0);
  }

  .min-w-\[2rem\] {
    min-width: 2rem;
  }

  .min-w-\[3rem\] {
    min-width: 3rem;
  }

  .min-w-\[24px\] {
    min-width: 24px;
  }

  .flex-1 {
    flex: 1;
  }

  .flex-shrink-0 {
    flex-shrink: 0;
  }

  .-translate-x-1\/2 {
    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .translate-x-1 {
    --tw-translate-x: calc(var(--spacing) * 1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .translate-x-6 {
    --tw-translate-x: calc(var(--spacing) * 6);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .-translate-y-1\/2 {
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }

  .scale-105 {
    --tw-scale-x: 105%;
    --tw-scale-y: 105%;
    --tw-scale-z: 105%;
    scale: var(--tw-scale-x) var(--tw-scale-y);
  }

  .rotate-180 {
    rotate: 180deg;
  }

  .transform {
    transform: var(--tw-rotate-x) var(--tw-rotate-y) var(--tw-rotate-z) var(--tw-skew-x) var(--tw-skew-y);
  }

  .animate-pulse {
    animation: var(--animate-pulse);
  }

  .animate-spin {
    animation: var(--animate-spin);
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .resize-none {
    resize: none;
  }

  .snap-x {
    scroll-snap-type: x var(--tw-scroll-snap-strictness);
  }

  .snap-mandatory {
    --tw-scroll-snap-strictness: mandatory;
  }

  .snap-start {
    scroll-snap-align: start;
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .flex-col {
    flex-direction: column;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .items-center {
    align-items: center;
  }

  .items-end {
    align-items: flex-end;
  }

  .items-start {
    align-items: flex-start;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .gap-1 {
    gap: calc(var(--spacing) * 1);
  }

  .gap-1\.5 {
    gap: calc(var(--spacing) * 1.5);
  }

  .gap-2 {
    gap: calc(var(--spacing) * 2);
  }

  .gap-3 {
    gap: calc(var(--spacing) * 3);
  }

  .gap-4 {
    gap: calc(var(--spacing) * 4);
  }

  .gap-6 {
    gap: calc(var(--spacing) * 6);
  }

  :where(.space-y-0\.5 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * .5) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * .5) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-1 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 1) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 1) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-2 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-3 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 3) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-4 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-5 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 5) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 5) * calc(1 - var(--tw-space-y-reverse)));
  }

  :where(.space-y-6 > :not(:last-child)) {
    --tw-space-y-reverse: 0;
    margin-block-start: calc(calc(var(--spacing) * 6) * var(--tw-space-y-reverse));
    margin-block-end: calc(calc(var(--spacing) * 6) * calc(1 - var(--tw-space-y-reverse)));
  }

  .gap-x-8 {
    column-gap: calc(var(--spacing) * 8);
  }

  :where(.space-x-1 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 1) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 1) * calc(1 - var(--tw-space-x-reverse)));
  }

  :where(.space-x-1\.5 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 1.5) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 1.5) * calc(1 - var(--tw-space-x-reverse)));
  }

  :where(.space-x-2 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 2) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-x-reverse)));
  }

  :where(.space-x-3 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 3) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-x-reverse)));
  }

  :where(.space-x-4 > :not(:last-child)) {
    --tw-space-x-reverse: 0;
    margin-inline-start: calc(calc(var(--spacing) * 4) * var(--tw-space-x-reverse));
    margin-inline-end: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)));
  }

  .gap-y-2 {
    row-gap: calc(var(--spacing) * 2);
  }

  .truncate {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .overflow-hidden {
    overflow: hidden;
  }

  .overflow-x-auto {
    overflow-x: auto;
  }

  .overflow-y-auto {
    overflow-y: auto;
  }

  .rounded {
    border-radius: .25rem;
  }

  .rounded-2xl {
    border-radius: var(--radius-2xl);
  }

  .rounded-3xl {
    border-radius: var(--radius-3xl);
  }

  .rounded-full {
    border-radius: 3.40282e38px;
  }

  .rounded-lg {
    border-radius: .625rem;
  }

  .rounded-xl {
    border-radius: 1.025rem;
  }

  .rounded-t-3xl {
    border-top-left-radius: var(--radius-3xl);
    border-top-right-radius: var(--radius-3xl);
  }

  .border {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }

  .border-2 {
    border-style: var(--tw-border-style);
    border-width: 2px;
  }

  .border-t {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }

  .border-r {
    border-right-style: var(--tw-border-style);
    border-right-width: 1px;
  }

  .border-b {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }

  .border-b-2 {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 2px;
  }

  .border-blue-100 {
    border-color: var(--color-blue-100);
  }

  .border-blue-200 {
    border-color: var(--color-blue-200);
  }

  .border-blue-500 {
    border-color: var(--color-blue-500);
  }

  .border-blue-600 {
    border-color: var(--color-blue-600);
  }

  .border-gray-100 {
    border-color: var(--color-gray-100);
  }

  .border-gray-200 {
    border-color: var(--color-gray-200);
  }

  .border-gray-300 {
    border-color: var(--color-gray-300);
  }

  .border-green-200 {
    border-color: var(--color-green-200);
  }

  .border-orange-200 {
    border-color: var(--color-orange-200);
  }

  .border-orange-300 {
    border-color: var(--color-orange-300);
  }

  .border-orange-500 {
    border-color: var(--color-orange-500);
  }

  .border-red-500 {
    border-color: var(--color-red-500);
  }

  .border-yellow-200 {
    border-color: var(--color-yellow-200);
  }

  .bg-black\/50 {
    background-color: #00000080;
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-black\/50 {
      background-color: color-mix(in oklab, var(--color-black) 50%, transparent);
    }
  }

  .bg-blue-50 {
    background-color: var(--color-blue-50);
  }

  .bg-blue-100 {
    background-color: var(--color-blue-100);
  }

  .bg-blue-500 {
    background-color: var(--color-blue-500);
  }

  .bg-blue-600 {
    background-color: var(--color-blue-600);
  }

  .bg-gray-50 {
    background-color: var(--color-gray-50);
  }

  .bg-gray-100 {
    background-color: var(--color-gray-100);
  }

  .bg-gray-200 {
    background-color: var(--color-gray-200);
  }

  .bg-gray-300 {
    background-color: var(--color-gray-300);
  }

  .bg-green-50 {
    background-color: var(--color-green-50);
  }

  .bg-green-100 {
    background-color: var(--color-green-100);
  }

  .bg-green-500 {
    background-color: var(--color-green-500);
  }

  .bg-orange-50 {
    background-color: var(--color-orange-50);
  }

  .bg-orange-100 {
    background-color: var(--color-orange-100);
  }

  .bg-orange-500 {
    background-color: var(--color-orange-500);
  }

  .bg-purple-100 {
    background-color: var(--color-purple-100);
  }

  .bg-purple-500 {
    background-color: var(--color-purple-500);
  }

  .bg-red-100 {
    background-color: var(--color-red-100);
  }

  .bg-red-500 {
    background-color: var(--color-red-500);
  }

  .bg-white {
    background-color: var(--color-white);
  }

  .bg-white\/20 {
    background-color: #fff3;
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-white\/20 {
      background-color: color-mix(in oklab, var(--color-white) 20%, transparent);
    }
  }

  .bg-white\/50 {
    background-color: #ffffff80;
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-white\/50 {
      background-color: color-mix(in oklab, var(--color-white) 50%, transparent);
    }
  }

  .bg-white\/90 {
    background-color: #ffffffe6;
  }

  @supports (color: color-mix(in lab, red, red)) {
    .bg-white\/90 {
      background-color: color-mix(in oklab, var(--color-white) 90%, transparent);
    }
  }

  .bg-yellow-50 {
    background-color: var(--color-yellow-50);
  }

  .bg-yellow-100 {
    background-color: var(--color-yellow-100);
  }

  .bg-gradient-to-br {
    --tw-gradient-position: to bottom right in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }

  .bg-gradient-to-l {
    --tw-gradient-position: to left in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }

  .bg-gradient-to-r {
    --tw-gradient-position: to right in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }

  .bg-gradient-to-t {
    --tw-gradient-position: to top in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
  }

  .from-black\/50 {
    --tw-gradient-from: #00000080;
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  @supports (color: color-mix(in lab, red, red)) {
    .from-black\/50 {
      --tw-gradient-from: color-mix(in oklab, var(--color-black) 50%, transparent);
    }
  }

  .from-blue-50 {
    --tw-gradient-from: var(--color-blue-50);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .from-blue-600 {
    --tw-gradient-from: var(--color-blue-600);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .from-orange-50 {
    --tw-gradient-from: var(--color-orange-50);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .from-white {
    --tw-gradient-from: var(--color-white);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .via-white {
    --tw-gradient-via: var(--color-white);
    --tw-gradient-via-stops: var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);
    --tw-gradient-stops: var(--tw-gradient-via-stops);
  }

  .to-blue-500 {
    --tw-gradient-to: var(--color-blue-500);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .to-orange-50 {
    --tw-gradient-to: var(--color-orange-50);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .to-red-50 {
    --tw-gradient-to: var(--color-red-50);
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .to-transparent {
    --tw-gradient-to: transparent;
    --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  }

  .bg-clip-text {
    background-clip: text;
  }

  .fill-yellow-400 {
    fill: var(--color-yellow-400);
  }

  .object-cover {
    object-fit: cover;
  }

  .p-1 {
    padding: calc(var(--spacing) * 1);
  }

  .p-2 {
    padding: calc(var(--spacing) * 2);
  }

  .p-3 {
    padding: calc(var(--spacing) * 3);
  }

  .p-4 {
    padding: calc(var(--spacing) * 4);
  }

  .p-6 {
    padding: calc(var(--spacing) * 6);
  }

  .p-8 {
    padding: calc(var(--spacing) * 8);
  }

  .p-12 {
    padding: calc(var(--spacing) * 12);
  }

  .px-2 {
    padding-inline: calc(var(--spacing) * 2);
  }

  .px-2\.5 {
    padding-inline: calc(var(--spacing) * 2.5);
  }

  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }

  .px-4 {
    padding-inline: calc(var(--spacing) * 4);
  }

  .px-5 {
    padding-inline: calc(var(--spacing) * 5);
  }

  .px-6 {
    padding-inline: calc(var(--spacing) * 6);
  }

  .px-8 {
    padding-inline: calc(var(--spacing) * 8);
  }

  .py-0\.5 {
    padding-block: calc(var(--spacing) * .5);
  }

  .py-1 {
    padding-block: calc(var(--spacing) * 1);
  }

  .py-1\.5 {
    padding-block: calc(var(--spacing) * 1.5);
  }

  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }

  .py-2\.5 {
    padding-block: calc(var(--spacing) * 2.5);
  }

  .py-3 {
    padding-block: calc(var(--spacing) * 3);
  }

  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }

  .py-6 {
    padding-block: calc(var(--spacing) * 6);
  }

  .py-8 {
    padding-block: calc(var(--spacing) * 8);
  }

  .py-12 {
    padding-block: calc(var(--spacing) * 12);
  }

  .py-16 {
    padding-block: calc(var(--spacing) * 16);
  }

  .pt-0 {
    padding-top: calc(var(--spacing) * 0);
  }

  .pt-3 {
    padding-top: calc(var(--spacing) * 3);
  }

  .pt-4 {
    padding-top: calc(var(--spacing) * 4);
  }

  .pt-5 {
    padding-top: calc(var(--spacing) * 5);
  }

  .pt-8 {
    padding-top: calc(var(--spacing) * 8);
  }

  .pr-2 {
    padding-right: calc(var(--spacing) * 2);
  }

  .pr-4 {
    padding-right: calc(var(--spacing) * 4);
  }

  .pr-8 {
    padding-right: calc(var(--spacing) * 8);
  }

  .pb-1 {
    padding-bottom: calc(var(--spacing) * 1);
  }

  .pb-2 {
    padding-bottom: calc(var(--spacing) * 2);
  }

  .pb-4 {
    padding-bottom: calc(var(--spacing) * 4);
  }

  .pb-6 {
    padding-bottom: calc(var(--spacing) * 6);
  }

  .pb-8 {
    padding-bottom: calc(var(--spacing) * 8);
  }

  .pb-20 {
    padding-bottom: calc(var(--spacing) * 20);
  }

  .pl-10 {
    padding-left: calc(var(--spacing) * 10);
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .font-mono {
    font-family: var(--font-mono);
  }

  .text-2xl {
    font-size: var(--text-2xl);
    line-height: var(--tw-leading, var(--text-2xl--line-height));
  }

  .text-3xl {
    font-size: var(--text-3xl);
    line-height: var(--tw-leading, var(--text-3xl--line-height));
  }

  .text-4xl {
    font-size: var(--text-4xl);
    line-height: var(--tw-leading, var(--text-4xl--line-height));
  }

  .text-5xl {
    font-size: var(--text-5xl);
    line-height: var(--tw-leading, var(--text-5xl--line-height));
  }

  .text-8xl {
    font-size: var(--text-8xl);
    line-height: var(--tw-leading, var(--text-8xl--line-height));
  }

  .text-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }

  .text-lg {
    font-size: var(--text-lg);
    line-height: var(--tw-leading, var(--text-lg--line-height));
  }

  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }

  .text-xl {
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
  }

  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }

  .leading-relaxed {
    --tw-leading: var(--leading-relaxed);
    line-height: var(--leading-relaxed);
  }

  .leading-tight {
    --tw-leading: var(--leading-tight);
    line-height: var(--leading-tight);
  }

  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }

  .font-medium {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }

  .font-semibold {
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
  }

  .whitespace-nowrap {
    white-space: nowrap;
  }

  .whitespace-pre-wrap {
    white-space: pre-wrap;
  }

  .text-blue-600 {
    color: var(--color-blue-600);
  }

  .text-blue-700 {
    color: var(--color-blue-700);
  }

  .text-blue-800 {
    color: var(--color-blue-800);
  }

  .text-blue-900 {
    color: var(--color-blue-900);
  }

  .text-gray-300 {
    color: var(--color-gray-300);
  }

  .text-gray-400 {
    color: var(--color-gray-400);
  }

  .text-gray-500 {
    color: var(--color-gray-500);
  }

  .text-gray-600 {
    color: var(--color-gray-600);
  }

  .text-gray-700 {
    color: var(--color-gray-700);
  }

  .text-gray-800 {
    color: var(--color-gray-800);
  }

  .text-gray-900 {
    color: var(--color-gray-900);
  }

  .text-green-500 {
    color: var(--color-green-500);
  }

  .text-green-600 {
    color: var(--color-green-600);
  }

  .text-green-700 {
    color: var(--color-green-700);
  }

  .text-green-800 {
    color: var(--color-green-800);
  }

  .text-orange-600 {
    color: var(--color-orange-600);
  }

  .text-orange-700 {
    color: var(--color-orange-700);
  }

  .text-orange-900 {
    color: var(--color-orange-900);
  }

  .text-purple-600 {
    color: var(--color-purple-600);
  }

  .text-purple-700 {
    color: var(--color-purple-700);
  }

  .text-red-600 {
    color: var(--color-red-600);
  }

  .text-red-700 {
    color: var(--color-red-700);
  }

  .text-transparent {
    color: #0000;
  }

  .text-white {
    color: var(--color-white);
  }

  .text-white\/80 {
    color: #fffc;
  }

  @supports (color: color-mix(in lab, red, red)) {
    .text-white\/80 {
      color: color-mix(in oklab, var(--color-white) 80%, transparent);
    }
  }

  .text-yellow-400 {
    color: var(--color-yellow-400);
  }

  .text-yellow-600 {
    color: var(--color-yellow-600);
  }

  .text-yellow-700 {
    color: var(--color-yellow-700);
  }

  .opacity-0 {
    opacity: 0;
  }

  .opacity-60 {
    opacity: .6;
  }

  .opacity-75 {
    opacity: .75;
  }

  .shadow-lg {
    --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, #0000001a), 0 4px 6px -4px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .shadow-md {
    --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a), 0 2px 4px -2px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .shadow-sm {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, #0000001a), 0 1px 2px -1px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .shadow-xl {
    --tw-shadow: 0 20px 25px -5px var(--tw-shadow-color, #0000001a), 0 8px 10px -6px var(--tw-shadow-color, #0000001a);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .outline {
    outline-style: var(--tw-outline-style);
    outline-width: 1px;
  }

  .drop-shadow-lg {
    --tw-drop-shadow-size: drop-shadow(0 4px 4px var(--tw-drop-shadow-color, #00000026));
    --tw-drop-shadow: drop-shadow(var(--drop-shadow-lg));
    filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, ) var(--tw-drop-shadow, );
  }

  .filter {
    filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, ) var(--tw-drop-shadow, );
  }

  .backdrop-blur-sm {
    --tw-backdrop-blur: blur(var(--blur-sm));
    -webkit-backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
    backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
  }

  .transition-all {
    transition-property: all;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .transition-colors {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .transition-transform {
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }

  .duration-200 {
    --tw-duration: .2s;
    transition-duration: .2s;
  }

  .duration-300 {
    --tw-duration: .3s;
    transition-duration: .3s;
  }

  .\[-ms-overflow-style\:none\] {
    -ms-overflow-style: none;
  }

  .\[scrollbar-width\:none\] {
    scrollbar-width: none;
  }

  @media (hover: hover) {
    .group-hover\:translate-x-1:is(:where(.group):hover *) {
      --tw-translate-x: calc(var(--spacing) * 1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }

  @media (hover: hover) {
    .group-hover\:scale-105:is(:where(.group):hover *) {
      --tw-scale-x: 105%;
      --tw-scale-y: 105%;
      --tw-scale-z: 105%;
      scale: var(--tw-scale-x) var(--tw-scale-y);
    }
  }

  @media (hover: hover) {
    .group-hover\:opacity-100:is(:where(.group):hover *) {
      opacity: 1;
    }
  }

  .placeholder\:text-gray-400::placeholder {
    color: var(--color-gray-400);
  }

  .last\:border-0:last-child {
    border-style: var(--tw-border-style);
    border-width: 0;
  }

  .last\:pb-0:last-child {
    padding-bottom: calc(var(--spacing) * 0);
  }

  @media (hover: hover) {
    .hover\:scale-105:hover {
      --tw-scale-x: 105%;
      --tw-scale-y: 105%;
      --tw-scale-z: 105%;
      scale: var(--tw-scale-x) var(--tw-scale-y);
    }
  }

  @media (hover: hover) {
    .hover\:scale-110:hover {
      --tw-scale-x: 110%;
      --tw-scale-y: 110%;
      --tw-scale-z: 110%;
      scale: var(--tw-scale-x) var(--tw-scale-y);
    }
  }

  @media (hover: hover) {
    .hover\:scale-\[1\.02\]:hover {
      scale: 1.02;
    }
  }

  @media (hover: hover) {
    .hover\:border-blue-500:hover {
      border-color: var(--color-blue-500);
    }
  }

  @media (hover: hover) {
    .hover\:border-gray-300:hover {
      border-color: var(--color-gray-300);
    }
  }

  @media (hover: hover) {
    .hover\:border-orange-300:hover {
      border-color: var(--color-orange-300);
    }
  }

  @media (hover: hover) {
    .hover\:bg-blue-50:hover {
      background-color: var(--color-blue-50);
    }
  }

  @media (hover: hover) {
    .hover\:bg-blue-100:hover {
      background-color: var(--color-blue-100);
    }
  }

  @media (hover: hover) {
    .hover\:bg-gray-50:hover {
      background-color: var(--color-gray-50);
    }
  }

  @media (hover: hover) {
    .hover\:bg-gray-100:hover {
      background-color: var(--color-gray-100);
    }
  }

  @media (hover: hover) {
    .hover\:bg-gray-200:hover {
      background-color: var(--color-gray-200);
    }
  }

  @media (hover: hover) {
    .hover\:bg-orange-50:hover {
      background-color: var(--color-orange-50);
    }
  }

  @media (hover: hover) {
    .hover\:bg-orange-50\/50:hover {
      background-color: color-mix(in srgb, oklch(.98 .016 73.684) 50%, transparent);
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-orange-50\/50:hover {
        background-color: color-mix(in oklab, var(--color-orange-50) 50%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:bg-red-50:hover {
      background-color: var(--color-red-50);
    }
  }

  @media (hover: hover) {
    .hover\:bg-red-600:hover {
      background-color: var(--color-red-600);
    }
  }

  @media (hover: hover) {
    .hover\:bg-white:hover {
      background-color: var(--color-white);
    }
  }

  @media (hover: hover) {
    .hover\:bg-white\/75:hover {
      background-color: #ffffffbf;
    }

    @supports (color: color-mix(in lab, red, red)) {
      .hover\:bg-white\/75:hover {
        background-color: color-mix(in oklab, var(--color-white) 75%, transparent);
      }
    }
  }

  @media (hover: hover) {
    .hover\:text-blue-600:hover {
      color: var(--color-blue-600);
    }
  }

  @media (hover: hover) {
    .hover\:text-blue-700:hover {
      color: var(--color-blue-700);
    }
  }

  @media (hover: hover) {
    .hover\:text-gray-900:hover {
      color: var(--color-gray-900);
    }
  }

  @media (hover: hover) {
    .hover\:text-red-600:hover {
      color: var(--color-red-600);
    }
  }

  @media (hover: hover) {
    .hover\:text-red-700:hover {
      color: var(--color-red-700);
    }
  }

  @media (hover: hover) {
    .hover\:underline:hover {
      text-decoration-line: underline;
    }
  }

  @media (hover: hover) {
    .hover\:shadow-lg:hover {
      --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, #0000001a), 0 4px 6px -4px var(--tw-shadow-color, #0000001a);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }

  .focus\:border-transparent:focus {
    border-color: #0000;
  }

  .focus\:ring-2:focus {
    --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }

  .focus\:ring-blue-500:focus {
    --tw-ring-color: var(--color-blue-500);
  }

  .focus\:ring-gray-500:focus {
    --tw-ring-color: var(--color-gray-500);
  }

  .focus\:ring-orange-500:focus {
    --tw-ring-color: var(--color-orange-500);
  }

  .focus\:ring-red-500:focus {
    --tw-ring-color: var(--color-red-500);
  }

  .focus\:ring-offset-2:focus {
    --tw-ring-offset-width: 2px;
    --tw-ring-offset-shadow: var(--tw-ring-inset, ) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  }

  .focus\:outline-none:focus {
    --tw-outline-style: none;
    outline-style: none;
  }

  .disabled\:cursor-not-allowed:disabled {
    cursor: not-allowed;
  }

  .disabled\:bg-gray-100:disabled {
    background-color: var(--color-gray-100);
  }

  .disabled\:opacity-60:disabled {
    opacity: .6;
  }

  @media (width >=40rem) {
    .sm\:mr-2 {
      margin-right: calc(var(--spacing) * 2);
    }
  }

  @media (width >=40rem) {
    .sm\:block {
      display: block;
    }
  }

  @media (width >=40rem) {
    .sm\:inline {
      display: inline;
    }
  }

  @media (width >=40rem) {
    .sm\:aspect-\[21\/9\] {
      aspect-ratio: 21 / 9;
    }
  }

  @media (width >=40rem) {
    .sm\:h-4 {
      height: calc(var(--spacing) * 4);
    }
  }

  @media (width >=40rem) {
    .sm\:h-5 {
      height: calc(var(--spacing) * 5);
    }
  }

  @media (width >=40rem) {
    .sm\:h-8 {
      height: calc(var(--spacing) * 8);
    }
  }

  @media (width >=40rem) {
    .sm\:h-16 {
      height: calc(var(--spacing) * 16);
    }
  }

  @media (width >=40rem) {
    .sm\:h-32 {
      height: calc(var(--spacing) * 32);
    }
  }

  @media (width >=40rem) {
    .sm\:w-4 {
      width: calc(var(--spacing) * 4);
    }
  }

  @media (width >=40rem) {
    .sm\:w-5 {
      width: calc(var(--spacing) * 5);
    }
  }

  @media (width >=40rem) {
    .sm\:w-8 {
      width: calc(var(--spacing) * 8);
    }
  }

  @media (width >=40rem) {
    .sm\:w-16 {
      width: calc(var(--spacing) * 16);
    }
  }

  @media (width >=40rem) {
    .sm\:w-32 {
      width: calc(var(--spacing) * 32);
    }
  }

  @media (width >=40rem) {
    .sm\:w-auto {
      width: auto;
    }
  }

  @media (width >=40rem) {
    .sm\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width >=40rem) {
    .sm\:flex-row {
      flex-direction: row;
    }
  }

  @media (width >=40rem) {
    .sm\:items-center {
      align-items: center;
    }
  }

  @media (width >=40rem) {
    :where(.sm\:space-x-3 > :not(:last-child)) {
      --tw-space-x-reverse: 0;
      margin-inline-start: calc(calc(var(--spacing) * 3) * var(--tw-space-x-reverse));
      margin-inline-end: calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-x-reverse)));
    }
  }

  @media (width >=40rem) {
    .sm\:rounded-3xl {
      border-radius: var(--radius-3xl);
    }
  }

  @media (width >=40rem) {
    .sm\:py-8 {
      padding-block: calc(var(--spacing) * 8);
    }
  }

  @media (width >=40rem) {
    .sm\:text-2xl {
      font-size: var(--text-2xl);
      line-height: var(--tw-leading, var(--text-2xl--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-3xl {
      font-size: var(--text-3xl);
      line-height: var(--tw-leading, var(--text-3xl--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-6xl {
      font-size: var(--text-6xl);
      line-height: var(--tw-leading, var(--text-6xl--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-base {
      font-size: var(--text-base);
      line-height: var(--tw-leading, var(--text-base--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-lg {
      font-size: var(--text-lg);
      line-height: var(--tw-leading, var(--text-lg--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-sm {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
  }

  @media (width >=40rem) {
    .sm\:text-xl {
      font-size: var(--text-xl);
      line-height: var(--tw-leading, var(--text-xl--line-height));
    }
  }

  @media (width >=48rem) {
    .md\:block {
      display: block;
    }
  }

  @media (width >=48rem) {
    .md\:flex {
      display: flex;
    }
  }

  @media (width >=48rem) {
    .md\:hidden {
      display: none;
    }
  }

  @media (width >=48rem) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width >=48rem) {
    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width >=48rem) {
    .md\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (width >=48rem) {
    .md\:text-2xl {
      font-size: var(--text-2xl);
      line-height: var(--tw-leading, var(--text-2xl--line-height));
    }
  }

  @media (width >=48rem) {
    .md\:text-7xl {
      font-size: var(--text-7xl);
      line-height: var(--tw-leading, var(--text-7xl--line-height));
    }
  }

  @media (width >=64rem) {
    .lg\:col-span-1 {
      grid-column: span 1 / span 1;
    }
  }

  @media (width >=64rem) {
    .lg\:col-span-2 {
      grid-column: span 2 / span 2;
    }
  }

  @media (width >=64rem) {
    .lg\:block {
      display: block;
    }
  }

  @media (width >=64rem) {
    .lg\:hidden {
      display: none;
    }
  }

  @media (width >=64rem) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width >=64rem) {
    .lg\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .\[\&\:\:-webkit-scrollbar\]\:hidden::-webkit-scrollbar {
    display: none;
  }
}

:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --spacing-xs: .5rem;
  --spacing-sm: .75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --radius-sm: .375rem;
  --radius-md: .5rem;
  --radius-lg: .75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 #0000000d;
  --shadow-md: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;
  --shadow-lg: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
  --shadow-xl: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;
  --transition-fast: .15s cubic-bezier(.4, 0, .2, 1);
  --transition-base: .2s cubic-bezier(.4, 0, .2, 1);
  --transition-slow: .3s cubic-bezier(.4, 0, .2, 1);
}

h1 {
  letter-spacing: -.025em;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
}

h2 {
  letter-spacing: -.025em;
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.3;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

h5 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
}

p {
  color: var(--color-gray-700);
  font-size: 1rem;
  line-height: 1.625;
}

small {
  color: var(--color-gray-600);
  font-size: .875rem;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-gray-900);
  background-color: var(--color-gray-50);
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.animate-slide-up {
  animation: slideUp var(--transition-slow) ease-out;
}

.animate-scale-in {
  animation: scaleIn var(--transition-base) ease-out;
}

.glass-effect {
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background: #fffc;
  border: 1px solid #fff3;
}

.gradient-primary {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-500) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, var(--color-secondary-600) 0%, var(--color-secondary-500) 100%);
}

.card-hover {
  transition: all var(--transition-base);
}

.card-hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

button {
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: inherit;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

input,
textarea,
select {
  font-family: inherit;
  font-size: 1rem;
}

input:focus,
textarea:focus,
select:focus {
  ring: 2px;
  ring-color: var(--color-primary-500);
  ring-offset: 2px;
  outline: none;
}

.container {
  width: 100%;
  max-width: 1200px;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  margin-left: auto;
  margin-right: auto;
}

@media (width >=640px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (width >=1024px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}

@property --tw-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-translate-z {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-scale-x {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}

@property --tw-scale-y {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}

@property --tw-scale-z {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}

@property --tw-rotate-x {
  syntax: "*";
  inherits: false;
  initial-value: rotateX(0);
}

@property --tw-rotate-y {
  syntax: "*";
  inherits: false;
  initial-value: rotateY(0);
}

@property --tw-rotate-z {
  syntax: "*";
  inherits: false;
  initial-value: rotateZ(0);
}

@property --tw-skew-x {
  syntax: "*";
  inherits: false;
  initial-value: skewX(0);
}

@property --tw-skew-y {
  syntax: "*";
  inherits: false;
  initial-value: skewY(0);
}

@property --tw-scroll-snap-strictness {
  syntax: "*";
  inherits: false;
  initial-value: proximity;
}

@property --tw-space-y-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-space-x-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}

@property --tw-border-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}

@property --tw-gradient-position {
  syntax: "*";
  inherits: false
}

@property --tw-gradient-from {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}

@property --tw-gradient-via {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}

@property --tw-gradient-to {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}

@property --tw-gradient-stops {
  syntax: "*";
  inherits: false
}

@property --tw-gradient-via-stops {
  syntax: "*";
  inherits: false
}

@property --tw-gradient-from-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0%;
}

@property --tw-gradient-via-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 50%;
}

@property --tw-gradient-to-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-leading {
  syntax: "*";
  inherits: false
}

@property --tw-font-weight {
  syntax: "*";
  inherits: false
}

@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-shadow-color {
  syntax: "*";
  inherits: false
}

@property --tw-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false
}

@property --tw-inset-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-ring-color {
  syntax: "*";
  inherits: false
}

@property --tw-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-inset-ring-color {
  syntax: "*";
  inherits: false
}

@property --tw-inset-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-ring-inset {
  syntax: "*";
  inherits: false
}

@property --tw-ring-offset-width {
  syntax: "<length>";
  inherits: false;
  initial-value: 0;
}

@property --tw-ring-offset-color {
  syntax: "*";
  inherits: false;
  initial-value: #fff;
}

@property --tw-ring-offset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}

@property --tw-outline-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}

@property --tw-blur {
  syntax: "*";
  inherits: false
}

@property --tw-brightness {
  syntax: "*";
  inherits: false
}

@property --tw-contrast {
  syntax: "*";
  inherits: false
}

@property --tw-grayscale {
  syntax: "*";
  inherits: false
}

@property --tw-hue-rotate {
  syntax: "*";
  inherits: false
}

@property --tw-invert {
  syntax: "*";
  inherits: false
}

@property --tw-opacity {
  syntax: "*";
  inherits: false
}

@property --tw-saturate {
  syntax: "*";
  inherits: false
}

@property --tw-sepia {
  syntax: "*";
  inherits: false
}

@property --tw-drop-shadow {
  syntax: "*";
  inherits: false
}

@property --tw-drop-shadow-color {
  syntax: "*";
  inherits: false
}

@property --tw-drop-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@property --tw-drop-shadow-size {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-blur {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-brightness {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-contrast {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-grayscale {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-hue-rotate {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-invert {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-opacity {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-saturate {
  syntax: "*";
  inherits: false
}

@property --tw-backdrop-sepia {
  syntax: "*";
  inherits: false
}

@property --tw-duration {
  syntax: "*";
  inherits: false
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

@import "tailwindcss";

/* virtual-fs:file:///styles/globals.css */
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

h5 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
}

p {
  font-size: 1rem;
  line-height: 1.625;
  color: var(--color-gray-700);
}

small {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-gray-600);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-gray-900);
  background-color: var(--color-gray-50);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.animate-slide-up {
  animation: slideUp var(--transition-slow) ease-out;
}

.animate-scale-in {
  animation: scaleIn var(--transition-base) ease-out;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-primary {
  background:
    linear-gradient(135deg,
      var(--color-primary-600) 0%,
      var(--color-primary-500) 100%);
}

.gradient-secondary {
  background:
    linear-gradient(135deg,
      var(--color-secondary-600) 0%,
      var(--color-secondary-500) 100%);
}

.card-hover {
  transition: all var(--transition-base);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input,
textarea,
select {
  font-family: inherit;
  font-size: 1rem;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
  ring-offset: 2px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 640px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}

/* 영수증 컨테이너: 화면에서는 숨김 */
#receipt-container {
  display: none;
}

@media print {

  /* 모든 요소 숨김 */
  body * {
    visibility: hidden;
  }

  /* 영수증 컨테이너만 보임 */
  #receipt-container,
  #receipt-container * {
    visibility: visible;
  }

  #receipt-container {
    display: block !important;
    /* display: none 오버라이드 */
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background-color: white;
    z-index: 9999;

    /* 폰트 및 스타일 강제 */
    color: black;
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.25;
    padding: 1rem;
  }

  @page {
    size: auto;
    margin: 0;
  }
}

/*# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3R5bGVzL2dsb2JhbHMuY3NzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJAX19kaXNhYmxlZF9pbXBvcnQgJ3RhaWx3aW5kY3NzJztcblxuLyogTW9kZXJuIERlc2lnbiBTeXN0ZW0gKi9cbjpyb290IHtcbiAgLyogUHJpbWFyeSBDb2xvcnMgLSBWaWJyYW50IEJsdWUgKi9cbiAgLS1jb2xvci1wcmltYXJ5LTUwOiAjZWZmNmZmO1xuICAtLWNvbG9yLXByaW1hcnktMTAwOiAjZGJlYWZlO1xuICAtLWNvbG9yLXByaW1hcnktMjAwOiAjYmZkYmZlO1xuICAtLWNvbG9yLXByaW1hcnktMzAwOiAjOTNjNWZkO1xuICAtLWNvbG9yLXByaW1hcnktNDAwOiAjNjBhNWZhO1xuICAtLWNvbG9yLXByaW1hcnktNTAwOiAjM2I4MmY2O1xuICAtLWNvbG9yLXByaW1hcnktNjAwOiAjMjU2M2ViO1xuICAtLWNvbG9yLXByaW1hcnktNzAwOiAjMWQ0ZWQ4O1xuICAtLWNvbG9yLXByaW1hcnktODAwOiAjMWU0MGFmO1xuICAtLWNvbG9yLXByaW1hcnktOTAwOiAjMWUzYThhO1xuICBcbiAgLyogU2Vjb25kYXJ5IENvbG9ycyAtIE9yYW5nZSBBY2NlbnQgKi9cbiAgLS1jb2xvci1zZWNvbmRhcnktNTA6ICNmZmY3ZWQ7XG4gIC0tY29sb3Itc2Vjb25kYXJ5LTEwMDogI2ZmZWRkNTtcbiAgLS1jb2xvci1zZWNvbmRhcnktMjAwOiAjZmVkN2FhO1xuICAtLWNvbG9yLXNlY29uZGFyeS0zMDA6ICNmZGJhNzQ7XG4gIC0tY29sb3Itc2Vjb25kYXJ5LTQwMDogI2ZiOTIzYztcbiAgLS1jb2xvci1zZWNvbmRhcnktNTAwOiAjZjk3MzE2O1xuICAtLWNvbG9yLXNlY29uZGFyeS02MDA6ICNlYTU4MGM7XG4gIC0tY29sb3Itc2Vjb25kYXJ5LTcwMDogI2MyNDEwYztcbiAgLS1jb2xvci1zZWNvbmRhcnktODAwOiAjOWEzNDEyO1xuICAtLWNvbG9yLXNlY29uZGFyeS05MDA6ICM3YzJkMTI7XG4gIFxuICAvKiBTdWNjZXNzIEdyZWVuICovXG4gIC0tY29sb3Itc3VjY2VzczogIzEwYjk4MTtcbiAgLS1jb2xvci1zdWNjZXNzLWxpZ2h0OiAjZDFmYWU1O1xuICBcbiAgLyogV2FybmluZyAqL1xuICAtLWNvbG9yLXdhcm5pbmc6ICNmNTllMGI7XG4gIC0tY29sb3Itd2FybmluZy1saWdodDogI2ZlZjNjNztcbiAgXG4gIC8qIEVycm9yICovXG4gIC0tY29sb3ItZXJyb3I6ICNlZjQ0NDQ7XG4gIC0tY29sb3ItZXJyb3ItbGlnaHQ6ICNmZWUyZTI7XG4gIFxuICAvKiBOZXV0cmFscyAqL1xuICAtLWNvbG9yLWdyYXktNTA6ICNmOWZhZmI7XG4gIC0tY29sb3ItZ3JheS0xMDA6ICNmM2Y0ZjY7XG4gIC0tY29sb3ItZ3JheS0yMDA6ICNlNWU3ZWI7XG4gIC0tY29sb3ItZ3JheS0zMDA6ICNkMWQ1ZGI7XG4gIC0tY29sb3ItZ3JheS00MDA6ICM5Y2EzYWY7XG4gIC0tY29sb3ItZ3JheS01MDA6ICM2YjcyODA7XG4gIC0tY29sb3ItZ3JheS02MDA6ICM0YjU1NjM7XG4gIC0tY29sb3ItZ3JheS03MDA6ICMzNzQxNTE7XG4gIC0tY29sb3ItZ3JheS04MDA6ICMxZjI5Mzc7XG4gIC0tY29sb3ItZ3JheS05MDA6ICMxMTE4Mjc7XG4gIFxuICAvKiBTcGFjaW5nICovXG4gIC0tc3BhY2luZy14czogMC41cmVtO1xuICAtLXNwYWNpbmctc206IDAuNzVyZW07XG4gIC0tc3BhY2luZy1tZDogMXJlbTtcbiAgLS1zcGFjaW5nLWxnOiAxLjVyZW07XG4gIC0tc3BhY2luZy14bDogMnJlbTtcbiAgLS1zcGFjaW5nLTJ4bDogM3JlbTtcbiAgXG4gIC8qIEJvcmRlciBSYWRpdXMgKi9cbiAgLS1yYWRpdXMtc206IDAuMzc1cmVtO1xuICAtLXJhZGl1cy1tZDogMC41cmVtO1xuICAtLXJhZGl1cy1sZzogMC43NXJlbTtcbiAgLS1yYWRpdXMteGw6IDFyZW07XG4gIC0tcmFkaXVzLTJ4bDogMS41cmVtO1xuICAtLXJhZGl1cy1mdWxsOiA5OTk5cHg7XG4gIFxuICAvKiBTaGFkb3dzICovXG4gIC0tc2hhZG93LXNtOiAwIDFweCAycHggMCByZ2IoMCAwIDAgLyAwLjA1KTtcbiAgLS1zaGFkb3ctbWQ6IDAgNHB4IDZweCAtMXB4IHJnYigwIDAgMCAvIDAuMSksIDAgMnB4IDRweCAtMnB4IHJnYigwIDAgMCAvIDAuMSk7XG4gIC0tc2hhZG93LWxnOiAwIDEwcHggMTVweCAtM3B4IHJnYigwIDAgMCAvIDAuMSksIDAgNHB4IDZweCAtNHB4IHJnYigwIDAgMCAvIDAuMSk7XG4gIC0tc2hhZG93LXhsOiAwIDIwcHggMjVweCAtNXB4IHJnYigwIDAgMCAvIDAuMSksIDAgOHB4IDEwcHggLTZweCByZ2IoMCAwIDAgLyAwLjEpO1xuICBcbiAgLyogVHJhbnNpdGlvbnMgKi9cbiAgLS10cmFuc2l0aW9uLWZhc3Q6IDE1MG1zIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gIC0tdHJhbnNpdGlvbi1iYXNlOiAyMDBtcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAtLXRyYW5zaXRpb24tc2xvdzogMzAwbXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbn1cblxuLyogVHlwb2dyYXBoeSAqL1xuaDEge1xuICBmb250LXNpemU6IDIuMjVyZW07XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGxpbmUtaGVpZ2h0OiAxLjI7XG4gIGxldHRlci1zcGFjaW5nOiAtMC4wMjVlbTtcbn1cblxuaDIge1xuICBmb250LXNpemU6IDEuODc1cmVtO1xuICBmb250LXdlaWdodDogNzAwO1xuICBsaW5lLWhlaWdodDogMS4zO1xuICBsZXR0ZXItc3BhY2luZzogLTAuMDI1ZW07XG59XG5cbmgzIHtcbiAgZm9udC1zaXplOiAxLjVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGxpbmUtaGVpZ2h0OiAxLjQ7XG59XG5cbmg0IHtcbiAgZm9udC1zaXplOiAxLjI1cmVtO1xuICBmb250LXdlaWdodDogNjAwO1xuICBsaW5lLWhlaWdodDogMS41O1xufVxuXG5oNSB7XG4gIGZvbnQtc2l6ZTogMS4xMjVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGxpbmUtaGVpZ2h0OiAxLjU7XG59XG5cbnAge1xuICBmb250LXNpemU6IDFyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjYyNTtcbiAgY29sb3I6IHZhcigtLWNvbG9yLWdyYXktNzAwKTtcbn1cblxuc21hbGwge1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBsaW5lLWhlaWdodDogMS41O1xuICBjb2xvcjogdmFyKC0tY29sb3ItZ3JheS02MDApO1xufVxuXG4vKiBCYXNlIFN0eWxlcyAqL1xuKiB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG59XG5cbmJvZHkge1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG4gIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsICdSb2JvdG8nLCAnT3h5Z2VuJyxcbiAgICAnVWJ1bnR1JywgJ0NhbnRhcmVsbCcsICdGaXJhIFNhbnMnLCAnRHJvaWQgU2FucycsICdIZWx2ZXRpY2EgTmV1ZScsXG4gICAgc2Fucy1zZXJpZjtcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogYW50aWFsaWFzZWQ7XG4gIC1tb3otb3N4LWZvbnQtc21vb3RoaW5nOiBncmF5c2NhbGU7XG4gIGNvbG9yOiB2YXIoLS1jb2xvci1ncmF5LTkwMCk7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyYXktNTApO1xufVxuXG4vKiBDdXN0b20gU2Nyb2xsYmFyICovXG46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgd2lkdGg6IDhweDtcbiAgaGVpZ2h0OiA4cHg7XG59XG5cbjo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1ncmF5LTEwMCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXJhZGl1cy1mdWxsKTtcbn1cblxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNvbG9yLWdyYXktNDAwKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tcmFkaXVzLWZ1bGwpO1xuICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIHZhcigtLXRyYW5zaXRpb24tYmFzZSk7XG59XG5cbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2xvci1ncmF5LTUwMCk7XG59XG5cbi8qIEFuaW1hdGlvbnMgKi9cbkBrZXlmcmFtZXMgZmFkZUluIHtcbiAgZnJvbSB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTBweCk7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICB9XG59XG5cbkBrZXlmcmFtZXMgc2xpZGVVcCB7XG4gIGZyb20ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTtcbiAgICBvcGFjaXR5OiAwO1xuICB9XG4gIHRvIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxufVxuXG5Aa2V5ZnJhbWVzIHNjYWxlSW4ge1xuICBmcm9tIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOTUpO1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxufVxuXG4uYW5pbWF0ZS1mYWRlLWluIHtcbiAgYW5pbWF0aW9uOiBmYWRlSW4gdmFyKC0tdHJhbnNpdGlvbi1iYXNlKSBlYXNlLW91dDtcbn1cblxuLmFuaW1hdGUtc2xpZGUtdXAge1xuICBhbmltYXRpb246IHNsaWRlVXAgdmFyKC0tdHJhbnNpdGlvbi1zbG93KSBlYXNlLW91dDtcbn1cblxuLmFuaW1hdGUtc2NhbGUtaW4ge1xuICBhbmltYXRpb246IHNjYWxlSW4gdmFyKC0tdHJhbnNpdGlvbi1iYXNlKSBlYXNlLW91dDtcbn1cblxuLyogVXRpbGl0eSBDbGFzc2VzICovXG4uZ2xhc3MtZWZmZWN0IHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpO1xuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbn1cblxuLmdyYWRpZW50LXByaW1hcnkge1xuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1jb2xvci1wcmltYXJ5LTYwMCkgMCUsIHZhcigtLWNvbG9yLXByaW1hcnktNTAwKSAxMDAlKTtcbn1cblxuLmdyYWRpZW50LXNlY29uZGFyeSB7XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHZhcigtLWNvbG9yLXNlY29uZGFyeS02MDApIDAlLCB2YXIoLS1jb2xvci1zZWNvbmRhcnktNTAwKSAxMDAlKTtcbn1cblxuLmNhcmQtaG92ZXIge1xuICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1iYXNlKTtcbn1cblxuLmNhcmQtaG92ZXI6aG92ZXIge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTRweCk7XG4gIGJveC1zaGFkb3c6IHZhcigtLXNoYWRvdy1sZyk7XG59XG5cbi8qIEhpZGUgc2Nyb2xsYmFyIHV0aWxpdHkgKi9cbi5oaWRlLXNjcm9sbGJhciB7XG4gIC1tcy1vdmVyZmxvdy1zdHlsZTogbm9uZTtcbiAgc2Nyb2xsYmFyLXdpZHRoOiBub25lO1xufVxuXG4uaGlkZS1zY3JvbGxiYXI6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLyogQnV0dG9uIEJhc2UgU3R5bGVzICovXG5idXR0b24ge1xuICBmb250LWZhbWlseTogaW5oZXJpdDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgdmFyKC0tdHJhbnNpdGlvbi1iYXNlKTtcbn1cblxuYnV0dG9uOmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMC42O1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xufVxuXG4vKiBJbnB1dCBCYXNlIFN0eWxlcyAqL1xuaW5wdXQsIHRleHRhcmVhLCBzZWxlY3Qge1xuICBmb250LWZhbWlseTogaW5oZXJpdDtcbiAgZm9udC1zaXplOiAxcmVtO1xufVxuXG5pbnB1dDpmb2N1cywgdGV4dGFyZWE6Zm9jdXMsIHNlbGVjdDpmb2N1cyB7XG4gIG91dGxpbmU6IG5vbmU7XG4gIHJpbmc6IDJweDtcbiAgcmluZy1jb2xvcjogdmFyKC0tY29sb3ItcHJpbWFyeS01MDApO1xuICByaW5nLW9mZnNldDogMnB4O1xufVxuXG4vKiBDb250YWluZXIgKi9cbi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiAxMjAwcHg7XG4gIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICBtYXJnaW4tcmlnaHQ6IGF1dG87XG4gIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2luZy1tZCk7XG4gIHBhZGRpbmctcmlnaHQ6IHZhcigtLXNwYWNpbmctbWQpO1xufVxuXG5AbWVkaWEgKG1pbi13aWR0aDogNjQwcHgpIHtcbiAgLmNvbnRhaW5lciB7XG4gICAgcGFkZGluZy1sZWZ0OiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgICBwYWRkaW5nLXJpZ2h0OiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgfVxufVxuXG5AbWVkaWEgKG1pbi13aWR0aDogMTAyNHB4KSB7XG4gIC5jb250YWluZXIge1xuICAgIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2luZy14bCk7XG4gICAgcGFkZGluZy1yaWdodDogdmFyKC0tc3BhY2luZy14bCk7XG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsbUJBQW1CO0FBR25CO0FBRUUsc0JBQW9CO0FBQ3BCLHVCQUFxQjtBQUNyQix1QkFBcUI7QUFDckIsdUJBQXFCO0FBQ3JCLHVCQUFxQjtB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 */
```

---

