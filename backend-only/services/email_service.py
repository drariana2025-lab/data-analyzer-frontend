import aiosmtplib
from email.message import EmailMessage
from backend.core.config import settings
import logging

class EmailService:
    @staticmethod
    async def send_notification(to_email: str, subject: str, body: str):
        """
        Sends an email notification using SMTP.
        """
        if not settings.SMTP_PASSWORD:
            logging.warning("SMTP Password not set. Skipping email.")
            return

        message = EmailMessage()
        message["From"] = settings.SMTP_USER
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_SERVER,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=False,
                start_tls=True,
            )
            logging.info(f"Email sent to {to_email}")
        except Exception as e:
            logging.error(f"Failed to send email: {str(e)}")

    @staticmethod
    async def notify_analysis_complete(to_email: str, filename: str):
        subject = f"Анализ завершен: {filename}"
        body = f"""
        Здравствуйте!
        
        Ваш файл "{filename}" был успешно проанализирован нашей платформой.
        Теперь вы можете просмотреть детальные графики и статистику в вашем личном кабинете.
        
        Ссылка на дашборд: http://localhost:8080/
        
        С уважением,
        Команда Disease Monitoring Platform
        """
        await EmailService.send_notification(to_email, subject, body)
