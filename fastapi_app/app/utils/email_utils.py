import smtplib
from email.mime.text import MIMEText

# 🔑 Use your Gmail
EMAIL_ADDRESS = "sathishkupps@gmail.com"
EMAIL_PASSWORD = "ymyp xohq pdbh ahjg"  # ⚠️ NOT your real password


def send_email(to_email: str, subject: str, message: str):
    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print("Email error:", e)