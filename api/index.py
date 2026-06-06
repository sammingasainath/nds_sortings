"""Vercel serverless entry point.

Exposes the FastAPI app from backend/main.py as an ASGI function. Vercel's
Python runtime detects the module-level `app` object and serves it.
"""
import os
import sys

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, BACKEND_DIR)

# Tell the backend where the bundled CSV lives (see vercel.json includeFiles).
os.environ.setdefault("CSV_PATH", os.path.join(BACKEND_DIR, "Scores with Names.csv"))

from main import app  # noqa: E402,F401  (imported for Vercel to discover `app`)
