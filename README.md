# Abhimithra Peddi — Portfolio

A single-page, Solo Leveling–themed portfolio for an AI/ML Engineer. It's a small Flask app that serves one page, deployed on Render.

## Features

- "Dungeon Gate" splash screen, shown once per browser session
- Light and dark themes: follows the OS setting and remembers the visitor's choice
- Animated hero stats, skill bars, scroll reveals, particles and shadow soldiers
- Side step tracker with the active section shown in the tab title
- Downloadable resume
- Works without JavaScript and respects reduced-motion settings

## Tech stack

- **Backend:** Python 3.11, Flask 3, gunicorn
- **Frontend:** plain HTML, CSS and JavaScript. No frameworks and no build step.
- **Hosting:** Render web service (`render.yaml`)

## Project structure

```
app.py                  # Flask app: one route (/) rendering templates/index.html
requirements.txt        # flask, gunicorn
render.yaml             # Render service config
templates/index.html    # Page markup + inline <head> script (theme, JS flag, gate skip)
static/
  css/style.css         # Theme tokens, layout, animations, no-JS / reduced-motion rules
  js/main.js            # All interactive behaviour
  img/                  # favicon, profile photo
  resume/               # Resume PDF
```

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py                    # http://localhost:5000
```

Or run it the way Render does:

```bash
gunicorn app:app
```

## Deploy (Render)

Pushing to `main` redeploys the service. The settings are in `render.yaml`:

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt` |
| Start command | `gunicorn app:app` |
| Python version | 3.11.0 |

The free Render plan puts the service to sleep after 15 minutes without traffic. The next visit then shows a "Service waking up" screen for 30–60 seconds. To avoid it, use an uptime checker (for example UptimeRobot) to load the URL every 10 minutes, or upgrade to a paid plan.

`app.py` uses `ProxyFix`, so absolute URLs such as `og:image` and `og:url` come out as `https://` behind Render's proxy.

## How the page works

1. **Before first paint:** an inline `<head>` script:
   - sets the theme from the saved choice, then the OS preference, then dark;
   - adds a `js` class to `<html>`;
   - hides the gate if it was already dismissed in this browser session.
2. **Gate (first visit only):**
   - The "Enter Dungeon" button gets focus, and the rest of the page is inert.
   - Clicking anywhere, pressing Enter or Space, or pressing Escape dismisses it, once.
3. **`startExperience()`:** runs once, when the visitor enters or straight away if the gate is skipped. It starts the scroll reveals, hero counters, typing effect, skill bars, particles, side tracker and shadow soldiers. System alerts appear only when entering through the gate.
4. **While scrolling:**
   - Sections reveal as they come into view, and skill bars fill.
   - The side tracker and tab title follow the section crossing the middle of the screen.
   - The scroll % display and back-to-top button show or hide.

### Fallbacks

| Situation | Behaviour |
|---|---|
| JavaScript off | No gate; all content visible; skill bars filled; real stat numbers shown |
| `main.js` fails to load | Same as JavaScript off: the `<head>` script removes the `js` class on page load |
| Reduced motion | No gate and no animations; final values shown right away |
| Repeat visit (same session) | Gate skipped; no system alerts |

## Editing content

All content is in `templates/index.html`:

- **Hero stats:** `<span class="counter" data-target="N">N</span>`. Keep both numbers the same. "Dungeons Cleared" should match the number of project cards.
- **Skill bars:** set `data-level="N"`, `style="--level:N%"`, `aria-valuenow="N"` and the visible level to the same value.
- **Sections:** each `<section data-step="N">` has a matching dot in the step tracker. Tab titles are set in `sectionNames` in `static/js/main.js`.
- **Resume:** replace `static/resume/Abhimithra_Peddi_Resume.pdf`, keeping the same file name.

## Contact

- Email: abhimithrapeddi07@gmail.com
- GitHub: [abhimithra02](https://github.com/abhimithra02)
- LinkedIn: [abhi-mithra-peddi624b64158](https://linkedin.com/in/abhi-mithra-peddi624b64158)
