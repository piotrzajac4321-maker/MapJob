# MapJob — Claude Instructions

## CRITICAL: Always send clickable links, never raw HTML files

When delivering any mockup, page, file, or result to the user — **always provide a clickable GitHub link**, not a file path or raw HTML snippet.

Format: `https://github.com/piotrzajac4321-maker/MapJob/blob/<branch>/path/to/file.html`

For the working branch `claude/announcement-visibility-design-Vb9Pw`:
- Base URL: `https://github.com/piotrzajac4321-maker/MapJob/blob/claude/announcement-visibility-design-Vb9Pw/`

For rendered HTML preview (GitHub Pages / raw):
- `https://raw.githack.com/piotrzajac4321-maker/MapJob/claude/announcement-visibility-design-Vb9Pw/path/to/file.html`

**Never** deliver work as a local file path like `/home/user/MapJob/mockups/...` without also including the clickable link.

## Project context

- **App**: MapJob.pl — geolocation job marketplace, Poland
- **Stack**: HTML/CSS/JS, Vercel, Supabase
- **Production branch**: `vercel-deploy`
- **Working branch**: `claude/announcement-visibility-design-Vb9Pw`
- **Theme**: Dark mode default, `design_refresh.css` tokens
- **DO NOT deploy to production** until user explicitly approves

## Design tokens (design_refresh.css)

```css
--bg:#0B0D10; --bg2:#101318; --surf:#15181F; --surf2:#1C2029;
--text:#F5F7FA; --text2:#A1A9B8; --text3:#6B7280;
--blue:#3B82F6; --green:#10B981; --gold:#D97706; --red:#EF4444;
font-family: 'Plus Jakarta Sans', 'Inter', -apple-system;
```
