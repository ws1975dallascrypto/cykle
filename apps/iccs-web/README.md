# International Credit Collection Services — Website

Premium static website for ICCS, catering to GCC banks.

## Files

```
iccs-web/
├── index.html          ← Main website (upload this + assets/)
└── assets/
    ├── style.css       ← All styles
    └── script.js       ← Animations, counters, form handling
```

## Hostinger Upload (via CYRAH / File Manager)

1. Open **Hostinger hPanel → File Manager**
2. Navigate to **`public_html`** (or your domain's root folder)
3. Upload **`index.html`** to `public_html/`
4. Upload the **`assets/`** folder to `public_html/assets/`

Your site structure on the server:
```
public_html/
├── index.html
└── assets/
    ├── style.css
    └── script.js
```

5. Visit your domain — the site is live. No build step needed.

## Customizing Contact Form

The form currently simulates a submission (console only). To wire it to a real backend:

- **Option A — Formspree (free, no backend needed):**
  Change the `<form>` tag in `index.html` to:
  ```html
  <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  ```
  Remove the JS form handler in `script.js`.

- **Option B — Your own PHP script:**
  Point the fetch in `script.js` to `assets/contact.php`.

## Customizing Content

| What to change | Where |
|---|---|
| Phone numbers / emails | `index.html` → `#contact` section |
| Company address | `index.html` → Contact Details |
| Stats numbers | `index.html` → `data-target` attributes on `.stat-number` |
| Colors (gold / navy) | `assets/style.css` → `:root` CSS variables |
| Logo icon text | `index.html` → `.logo-icon` elements |
