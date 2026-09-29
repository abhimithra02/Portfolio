import logging
import os
import threading
import time
from collections import defaultdict, deque

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from werkzeug.middleware.proxy_fix import ProxyFix

# Load settings such as ANTHROPIC_API_KEY from a local .env file, if there is one.
# Must run before importing chatbot, which reads its settings at import time.
# Variables already set in the environment (e.g. on Render) take precedence.
load_dotenv()

from chatbot import ResumeChatbot  # noqa: E402

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = Flask(__name__)
# Render terminates HTTPS at its proxy; trust X-Forwarded-For/Proto/Host so
# _external URLs (og:image, og:url) come out as https:// and rate limiting sees the real client IP
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Build the resume index once at startup; the page still works if this fails
try:
    chatbot = ResumeChatbot()
except Exception:
    log.exception("Resume chatbot failed to start")
    chatbot = None

MAX_QUESTION_CHARS = 500
MAX_HISTORY_MESSAGES = 6
RATE_LIMIT = int(os.environ.get("CHAT_RATE_LIMIT", "12"))  # requests per IP per minute
_requests = defaultdict(deque)
_requests_lock = threading.Lock()


def _rate_limited(ip):
    now = time.monotonic()
    with _requests_lock:
        q = _requests[ip]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE_LIMIT:
            return True
        q.append(now)
        if len(_requests) > 10000:  # drop idle IPs so memory stays bounded
            for key in [k for k, v in _requests.items() if not v]:
                del _requests[key]
        return False


def _clean_history(raw):
    """Keep only well-formed, alternating user/assistant turns (oldest first, ending on assistant)."""
    if not isinstance(raw, list):
        return []
    turns = [
        {"role": m["role"], "content": m["content"].strip()[:1500]}
        for m in raw[-MAX_HISTORY_MESSAGES:]
        if isinstance(m, dict) and m.get("role") in ("user", "assistant")
        and isinstance(m.get("content"), str) and m["content"].strip()
    ]
    while turns and turns[0]["role"] != "user":
        turns.pop(0)
    for i, m in enumerate(turns):
        if m["role"] != ("user" if i % 2 == 0 else "assistant"):
            return []
    if turns and turns[-1]["role"] != "assistant":
        turns.pop()
    return turns


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/api/chat")
def chat():
    if chatbot is None:
        return jsonify(error="The chatbot is unavailable right now."), 503
    if _rate_limited(request.remote_addr or "unknown"):
        return jsonify(error="Too many questions at once. Please wait a minute and try again."), 429

    data = request.get_json(silent=True) or {}
    question = data.get("question")
    if not isinstance(question, str) or not question.strip():
        return jsonify(error="Please type a question."), 400
    question = question.strip()
    if len(question) > MAX_QUESTION_CHARS:
        return jsonify(error=f"Please keep questions under {MAX_QUESTION_CHARS} characters."), 400

    return jsonify(chatbot.answer(question, _clean_history(data.get("history"))))


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
