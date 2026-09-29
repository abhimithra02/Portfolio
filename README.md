# Abhimithra Peddi — Portfolio

A single-page, Solo Leveling–themed portfolio for an AI/ML Engineer. It's a small Flask app that serves one page plus a resume chatbot API, deployed on Render.

## Features

- "Dungeon Gate" splash screen, shown once per browser session
- Light and dark themes: follows the OS setting and remembers the visitor's choice
- Animated hero stats, skill bars, scroll reveals, particles and shadow soldiers
- Side step tracker with the active section shown in the tab title
- Downloadable resume
- "Ask the System" chatbot that answers visitors' questions from the resume (RAG)
- Works without JavaScript and respects reduced-motion settings

## Tech stack

- **Backend:** Python 3.11, Flask 3, gunicorn
- **Chatbot:** pypdf (resume parsing), rank-bm25 (retrieval), Anthropic SDK (optional answer writing)
- **Frontend:** plain HTML, CSS and JavaScript. No frameworks and no build step.
- **Hosting:** Render web service (`render.yaml`)

## Project structure

```
app.py                  # Flask app: / renders the page, POST /api/chat answers resume questions
chatbot.py              # Resume RAG: PDF parsing, chunking, BM25 retrieval, answer generation
requirements.txt        # flask, gunicorn, pypdf, rank-bm25, anthropic
render.yaml             # Render service config
templates/index.html    # Page markup + inline <head> script (theme, JS flag, gate skip)
static/
  css/style.css         # Theme tokens, layout, animations, no-JS / reduced-motion rules
  js/main.js            # All interactive behaviour
  img/                  # favicon, profile photo
  resume/               # Resume PDF (also the chatbot's knowledge source)
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
| Start command | `gunicorn app:app --timeout 60` |
| Python version | 3.11.0 |
| `ANTHROPIC_API_KEY` | Optional; set in the Render dashboard to turn on LLM-written chatbot answers |

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
| JavaScript off | No gate; all content visible; skill bars filled; real stat numbers shown; chatbot hidden |
| `main.js` fails to load | Same as JavaScript off: the `<head>` script removes the `js` class on page load |
| Reduced motion | No gate and no animations; final values shown right away |
| Repeat visit (same session) | Gate skipped; no system alerts |

## Resume chatbot

The "Ask the System" button (bottom right) opens a chat that answers questions using only the resume PDF.

1. **Load and chunk (at startup):** `chatbot.py` reads `static/resume/Abhimithra_Peddi_Resume.pdf` with pypdf and splits it along the resume's own structure: one chunk per bullet, labelled with its section and job title or project name. It also adds a "career timeline" chunk listing every role.
2. **Retrieve:** each question is ranked against the chunks with BM25, plus a small synonym list (for example "college" → education). For short follow-ups, the previous question is folded in.
3. **Answer:**
   - **With `ANTHROPIC_API_KEY` set:** Claude (`claude-opus-5-5` at low effort; override with `CHAT_MODEL`) writes a short answer from the retrieved chunks only. The prompt tells it not to invent facts and to point to the email address when the resume doesn't say. The request opts into server-side refusal fallbacks.
   - **Without a key, or if the API call fails:** the top matching resume lines are returned as they are, so the chatbot always works and costs nothing.

**Protection:** questions are limited to 500 characters, and each IP gets 12 questions per minute (`CHAT_RATE_LIMIT`). The limit is kept in memory per gunicorn worker.

Replacing the resume PDF updates the chatbot on the next deploy. If you rename the resume's section headings, update `SECTIONS` in `chatbot.py`.

| Environment variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | unset | Turns on LLM-written answers |
| `CHAT_MODEL` | `claude-opus-5-5` | Model for answers |
| `CHAT_RATE_LIMIT` | `12` | Questions per IP per minute |

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
