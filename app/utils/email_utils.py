# /mentormind-backend/app/utils/email_utils.py
# This is a placeholder for a real email sending utility.
# In a production environment, you would integrate with a service
# like SendGrid, Amazon SES, or use Python's smtplib.

def send_email(to_email: str, subject: str, body: str):
    """
    (Placeholder) Mocks sending an email.
    """
    print("--- MOCK EMAIL SENDER ---")
    print(f"Recipient: {to_email}")
    print(f"Subject: {subject}")
    print("Body:")
    print(body)
    print("-------------------------")
    # In a real implementation:
    # import smtplib
    # from email.mime.text import MIMEText
    # msg = MIMEText(body)
    # msg['Subject'] = subject
    # msg['From'] = 'noreply@mentormind.com'
    # msg['To'] = to_email
    # with smtplib.SMTP('smtp.example.com', 587) as server:
    #     server.login('user', 'password')
    #     server.send_message(msg)
    print(f"Email successfully sent to {to_email}")
