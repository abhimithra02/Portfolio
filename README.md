# Abhimithra Peddi — Portfolio

A single-page, Solo Leveling–themed portfolio for an AI/ML Engineer. It's a small Flask app that serves one page plus a resume chatbot API, deployed on Render.

## Features

- "Dungeon Gate" splash screen, shown once per browser session
- Light and dark themes: follows the OS setting and remembers the visitor's choice
- Animated hero stats, skill bars, scroll reveals, particles and shadow soldiers
- Side step tracker with the active section shown in the tab title
- Downloadable resume
- "Igris" chatbot that answers visitors' questions from the resume (RAG), by text or by voice
- Say "Arise" to summon Igris hands-free (opt-in wake word)
- Works without JavaScript and respects reduced-motion settings
- Accessible: WCAG AA text contrast in both themes, full keyboard navigation, screen-reader landmarks

## Tech stack

- **Backend:** Python 3.11, Flask 3, gunicorn
- **Chatbot:** pypdf (resume parsing), rank-bm25 (retrieval), Anthropic SDK (optional answer writing)
- **Frontend:** plain HTML, CSS and JavaScript. No frameworks and no build step.
- **Voice:** the browser's built-in Web Speech API (speech recognition and speech synthesis)
- **Hosting:** Render web service (`render.yaml`)

## Project structure

```
app.py                  # Flask app: / renders the page, POST /api/chat answers resume questions
chatbot.py              # Resume RAG: PDF parsing, chunking, BM25 retrieval, answer generation
requirements.txt        # flask, gunicorn, pypdf, rank-bm25, anthropic, python-dotenv
.env.example            # Template for a local .env (API key, chatbot settings)
render.yaml             # Render service config
templates/index.html    # Page markup + inline <head> script (theme, JS flag, gate skip)
static/
  css/style.css         # Theme tokens, layout, animations, no-JS / reduced-motion rules
  js/main.js            # All interactive behaviour
  img/                  # favicon; profile-320.webp (on-page avatar), profile.webp (link previews), profile.jpg (unused)
  resume/               # Resume PDF (also the chatbot's knowledge source)
```

## Run locally

You need **Python 3.10 or newer** and **Git**. Check with `python --version` and `git --version`; on Mac, use `python3` if `python` isn't found.

**1. Get the code**

```bash
git clone https://github.com/abhimithra02/Portfolio.git
cd Portfolio
```

If you already have it, run `git checkout main && git pull` instead.

**2. Create a virtual environment and install dependencies**

Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Mac / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The prompt shows `(.venv)` while the environment is active.

**3. Start the app**

```bash
python app.py
```

The terminal should print `Resume index built: 40 chunks` and `Running on http://127.0.0.1:5000`. Keep it open, and stop it with Ctrl+C.

**4. Try it**

Open http://localhost:5000, click **Enter Dungeon**, then **Igris** in the bottom-right corner and ask a question, for example "What certifications are listed?". To ask by voice, tap the microphone and speak; Igris reads the answer aloud.

**Optional: Claude-written chatbot answers**

Without a key, the chatbot answers with the matching resume lines. To have Claude write the answers, put your Anthropic API key in a `.env` file (create one at https://console.anthropic.com under Settings → API Keys):

```bash
cp .env.example .env               # Windows: copy .env.example .env
```

Open `.env` and fill in the key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then run `python app.py` again. It should print `LLM answers enabled`.

`.env` is ignored by Git, so the key never gets committed; never put a real key in `.env.example`. You can also set the variable in the terminal instead (`export ANTHROPIC_API_KEY=...`, or `$env:ANTHROPIC_API_KEY="..."` in PowerShell). A variable set in the environment takes precedence over `.env`.

**Run it the way Render does** (Mac / Linux only; gunicorn doesn't run on Windows):

```bash
gunicorn app:app --timeout 60
```

**Troubleshooting**

| Problem | Fix |
|---|---|
| Windows: "running scripts is disabled" when activating | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, answer **Y**, then activate again |
| Mac: port 5000 already in use (AirPlay Receiver) | Turn off AirPlay Receiver in System Settings, or run `flask --app app run --port 5001` and open http://localhost:5001 |
| `pip install` fails | Upgrade pip with `python -m pip install --upgrade pip` and try again |
| Chatbot says it is unavailable | Check the terminal for errors; the resume PDF must be at `static/resume/Abhimithra_Peddi_Resume.pdf` |

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

The **Igris** button (bottom right, a knight's helmet with a red plume) opens a chat that answers questions using only the resume PDF.

1. **Load and chunk (at startup):** `chatbot.py` reads `static/resume/Abhimithra_Peddi_Resume.pdf` with pypdf and splits it along the resume's own structure: one chunk per bullet, labelled with its section and job title or project name. It also adds a "career timeline" chunk listing every role.
2. **Retrieve:** each question is ranked against the chunks with BM25, plus a small synonym list (for example "college" → education). Dotted terms match by their parts ("React" finds "React.js"), and simple plurals are folded ("hackathons" finds "Hackathon"). For short follow-ups, the previous question is folded in.
   - Broad questions that only name a section ("What projects has Abhimithra built?", "What certifications…?") return every item in that section rather than the top matches.
   - Greetings, "Who are you?" and "Thanks" get short replies from Igris without searching the resume.
3. **Answer:**
   - **With `ANTHROPIC_API_KEY` set:** Claude (`claude-opus-5-5` at low effort; override with `CHAT_MODEL`) writes a short answer from the retrieved chunks only. The prompt tells it not to invent facts and to point to the email address when the resume doesn't say. The request opts into server-side refusal fallbacks.
   - **Without a key, or if the API call fails:** the top matching resume lines are returned as they are, so the chatbot always works and costs nothing.

### Voice

Igris can listen and talk back, like a voice assistant. Both parts use the browser's built-in Web Speech API, so there are no extra keys, services or server changes.

- **Asking by voice:** tap the microphone next to the text box and speak. The words appear as you talk, and the question is sent when you stop. Tap again to stop early.
- **Spoken replies:** Igris reads each answer aloud, preferring a deep British English voice (rate 0.95, pitch 0.8) and falling back to any English voice on the device. The reply glows while it is spoken. Long answers are spoken sentence by sentence, because Chrome cuts off long single utterances.
- **"Arise" wake word:** turn on the **Arise** switch in the chat header, then close the chat and say "Arise" to summon Igris. Igris opens, says "I am here, my liege…", and listens for your question. Saying "Arise, what is the current role?" in one go opens Igris and asks straight away. "A rise" is also accepted at the start of a phrase, because speech engines often hear it that way; "a rise" in the middle of ordinary speech ("there was a rise in prices") is ignored.
  - It is opt-in and off by default. The browser asks for microphone permission when you switch it on.
  - Igris listens for the wake word only while the switch is on, the chat is closed, and the tab is visible. A glowing dot on the Igris button shows whenever it is listening.
  - The choice is remembered. On later visits it resumes automatically if microphone permission is still granted; if the browser needs to ask again, it waits for your first click, and if access was blocked, it switches itself off.
  - Browsers stop continuous listening from time to time; Igris restarts it, and backs off if it keeps failing.
  - Igris only starts listening for your question after it has finished speaking its greeting, so it doesn't hear itself.
- If you say "Arise, <question>" while an earlier answer is still loading, the question is asked as soon as that answer arrives. An answer that arrives after you close the chat is shown but not spoken.
- **Mute:** the speaker button in the chat header turns spoken replies on or off. The choice is remembered in the browser. Speech also stops when the visitor closes the chat, starts a new question, or taps the mic.
- **Browser support:** spoken replies work in all major browsers. Voice input and "Arise" work in Chrome, Edge and Safari; the mic button is hidden where it isn't supported (for example Firefox), and typing always works.
- **Requirements:** voice input needs HTTPS (or `localhost`) and the visitor's permission to use the microphone. If access is blocked, Igris says how to allow it.
- **Privacy:** in Chrome and Edge, speech recognition sends the recorded audio to the browser vendor's speech service to be transcribed. Nothing is recorded or stored by this site; only the transcribed text is sent to `/api/chat`, like a typed question.

**Protection:** questions are limited to 500 characters and request bodies to 32 KB, and each IP gets 12 questions per minute (`CHAT_RATE_LIMIT`). The limit is kept in memory per gunicorn worker. API errors are returned as JSON.

Every response also carries basic security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that allows the microphone for this site only (needed for voice).

Replacing the resume PDF updates the chatbot on the next deploy. If you rename the resume's section headings, update `SECTIONS` in `chatbot.py`.

Set these in a local `.env` file (see `.env.example`) or, on Render, under **Environment**.

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
- **Resume:** replace `static/resume/Abhimithra_Peddi_Resume.pdf`, keeping the same file name. The chatbot re-reads it on the next start.
- **Profile photo:** the page shows `static/img/profile-320.webp` (320 × 320, about 15 KB); `profile.webp` is the full-size copy used for link previews. After replacing the photo, regenerate the small copy, for example with Pillow:

  ```bash
  pip install pillow
  python -c "from PIL import Image; Image.open('static/img/profile.webp').convert('RGB').resize((320, 320)).save('static/img/profile-320.webp', quality=82)"
  ```

- **Igris's suggested questions:** the buttons inside `#chatSuggestions` in `templates/index.html`. Igris's replies to greetings, "Who are you?" and "Thanks" are in `chatbot.py`.
- **Colours:** theme colours are CSS variables at the top of `static/css/style.css` (`:root` for dark, `[data-theme="light"]` for light). Text colours were chosen to meet WCAG AA contrast (4.5:1); re-check contrast if you change them.

## Quality checks

There is no automated test suite; after changes, check these by hand (Chrome DevTools covers most of them):

| Check | How |
|---|---|
| Page and chatbot work | Run the app, enter through the gate, ask Igris a few questions by typing and by voice |
| Chat API rejects bad input | `curl -X POST localhost:5000/api/chat -H "Content-Type: application/json" -d "[1]"` should return 400, not 500 |
| Accessibility | Lighthouse (DevTools → Lighthouse → Accessibility) or the axe DevTools extension should report no contrast issues, in both themes |
| No-JS fallback | DevTools → Settings → Debugger → Disable JavaScript: all content should show, with no gate and no chat button |
| Reduced motion | DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce": no gate, no animations |
| Mobile | DevTools device toolbar at 320–414 px: no sideways scrolling, and the chat panel fits the screen |
| Security headers | `curl -I localhost:5000/` should show `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` |

## Contact

- Email: abhimithrapeddi07@gmail.com
- GitHub: [abhimithra02](https://github.com/abhimithra02)
- LinkedIn: [abhi-mithra-peddi624b64158](https://linkedin.com/in/abhi-mithra-peddi624b64158)
