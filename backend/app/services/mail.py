from urllib.parse import urlencode

import requests

from app.config import settings

MAILTRAP_SEND_URL = "https://send.api.mailtrap.io/api/send"


def build_magic_link(token: str) -> str:
    return f"{settings.APP_SCHEME}://auth?{urlencode({'token': token})}"


def send_magic_link_email(email: str, magic_link: str) -> None:
    if not settings.MAILTRAP_KEY:
        raise RuntimeError("MAILTRAP_KEY is not configured")

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #223022;">
        <h2>Sign in to {settings.APP_NAME}</h2>
        <p>Tap the button below on your phone to finish signing in.</p>
        <p>
          <a
            href="{magic_link}"
            style="display:inline-block;padding:12px 20px;border-radius:999px;background:#7cb342;color:#ffffff;text-decoration:none;font-weight:600;"
          >Open {settings.APP_NAME}</a>
        </p>
        <p>If the button does not open the app, copy and paste this link into your phone browser:</p>
        <p>{magic_link}</p>
      </body>
    </html>
    """.strip()

    response = requests.post(
        MAILTRAP_SEND_URL,
        headers={
            "Authorization": f"Bearer {settings.MAILTRAP_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": {
                "email": settings.MAIL_FROM,
                "name": settings.APP_NAME,
            },
            "to": [{"email": email}],
            "subject": f"Your {settings.APP_NAME} magic link",
            "text": f"Open this link on your phone to sign in: {magic_link}",
            "html": html,
            "category": "auth",
        },
        timeout=15,
    )
    response.raise_for_status()
