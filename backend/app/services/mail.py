from email.message import EmailMessage
from email.utils import formataddr
import smtplib

from app.config import settings


class MailDeliveryError(RuntimeError):
    pass


def send_otp_email(email: str, code: str) -> None:
    smtp_password = settings.MAILTRAP_SMTP_PASSWORD or settings.MAILTRAP_KEY
    if not smtp_password:
        raise MailDeliveryError("MAILTRAP_SMTP_PASSWORD or MAILTRAP_KEY is not configured")

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #223022;">
        <h2>Sign in to {settings.APP_NAME}</h2>
        <p>Copy this 6-digit code into the {settings.APP_NAME} app to finish signing in.</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#20251c;margin:24px 0;">{code}</p>
        <p>This code expires in {settings.OTP_EXPIRE_MINUTES} minutes. If you did not request it, you can ignore this email.</p>
      </body>
    </html>
    """.strip()

    message = EmailMessage()
    message["From"] = formataddr((settings.APP_NAME, settings.MAIL_FROM))
    message["To"] = email
    message["Subject"] = f"Your {settings.APP_NAME} sign-in code"
    message.set_content(
        f"Your {settings.APP_NAME} sign-in code is {code}. "
        f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes."
    )
    message.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(
            settings.MAILTRAP_SMTP_HOST,
            settings.MAILTRAP_SMTP_PORT,
            timeout=15,
        ) as smtp:
            smtp.starttls()
            smtp.login(settings.MAILTRAP_SMTP_USERNAME, smtp_password)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        raise MailDeliveryError(f"Mailtrap SMTP send failed: {exc}") from exc
