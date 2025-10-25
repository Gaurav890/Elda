"""
Firebase Cloud Messaging Service
Handles push notifications to mobile devices
"""

import logging
import os
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class FirebaseService:
    """
    Service for sending push notifications via Firebase Cloud Messaging (FCM)

    This service handles:
    - Sending reminders to patients
    - Sending alerts to patients
    - Managing device tokens
    """

    def __init__(self):
        """Initialize Firebase Admin SDK"""
        self._initialized = False
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK with service account credentials"""
        try:
            import firebase_admin
            from firebase_admin import credentials, messaging

            # Check if already initialized
            if firebase_admin._apps:
                self._initialized = True
                logger.info("Firebase Admin SDK already initialized")
                return

            # Look for credentials file
            credentials_path = os.getenv(
                'FIREBASE_CREDENTIALS_PATH',
                'firebase-credentials.json'
            )

            # Check if credentials file exists
            if not Path(credentials_path).exists():
                logger.warning(
                    f"Firebase credentials file not found at {credentials_path}. "
                    "Push notifications will be mocked. "
                    "To enable real push notifications, add firebase-credentials.json"
                )
                self._initialized = False
                return

            # Initialize Firebase Admin SDK
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)

            self._initialized = True
            logger.info("Firebase Admin SDK initialized successfully")

        except ImportError:
            logger.warning(
                "firebase-admin package not installed. "
                "Push notifications will be mocked. "
                "Install with: pip install firebase-admin"
            )
            self._initialized = False
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            self._initialized = False

    async def send_reminder(
        self,
        device_token: str,
        reminder_id: str,
        speak_text: str,
        reminder_type: str = "medication",
        **kwargs
    ) -> bool:
        """
        Send reminder notification to patient's device

        Args:
            device_token: Firebase device token
            reminder_id: UUID of the reminder
            speak_text: Text to be spoken by TTS
            reminder_type: Type of reminder (medication, meal, etc.)
            **kwargs: Additional data to include

        Returns:
            True if sent successfully, False otherwise
        """
        if not self._initialized:
            logger.info(
                f"[MOCKED] Would send reminder to device {device_token[:10]}..."
            )
            logger.info(f"[MOCKED] Reminder: {speak_text}")
            return True

        try:
            from firebase_admin import messaging

            # Create notification message
            message = messaging.Message(
                token=device_token,
                notification=messaging.Notification(
                    title="Reminder",
                    body=speak_text[:100]  # Truncate for notification
                ),
                data={
                    "type": "reminder",
                    "reminder_id": reminder_id,
                    "reminder_type": reminder_type,
                    "speak_text": speak_text,
                    **{k: str(v) for k, v in kwargs.items()}
                },
                android=messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        sound="default",
                        channel_id="reminders",
                        priority="high"
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound="default",
                            content_available=True,
                            badge=1
                        )
                    )
                )
            )

            # Send message
            response = messaging.send(message)
            logger.info(f"Successfully sent reminder to device. Response: {response}")
            return True

        except Exception as e:
            logger.error(f"Failed to send reminder notification: {e}")
            return False

    async def send_alert(
        self,
        device_token: str,
        alert_id: str,
        alert_title: str,
        alert_message: str,
        severity: str = "medium",
        **kwargs
    ) -> bool:
        """
        Send alert notification to patient's device

        Args:
            device_token: Firebase device token
            alert_id: UUID of the alert
            alert_title: Alert title
            alert_message: Alert message
            severity: Alert severity (low, medium, high, critical)
            **kwargs: Additional data to include

        Returns:
            True if sent successfully, False otherwise
        """
        if not self._initialized:
            logger.info(
                f"[MOCKED] Would send alert to device {device_token[:10]}..."
            )
            logger.info(f"[MOCKED] Alert: {alert_title} - {alert_message}")
            return True

        try:
            from firebase_admin import messaging

            # Determine priority based on severity
            priority = "high" if severity in ["high", "critical"] else "normal"

            # Create notification message
            message = messaging.Message(
                token=device_token,
                notification=messaging.Notification(
                    title=alert_title,
                    body=alert_message[:200]  # Truncate for notification
                ),
                data={
                    "type": "alert",
                    "alert_id": alert_id,
                    "severity": severity,
                    "alert_title": alert_title,
                    "alert_message": alert_message,
                    **{k: str(v) for k, v in kwargs.items()}
                },
                android=messaging.AndroidConfig(
                    priority=priority,
                    notification=messaging.AndroidNotification(
                        sound="default",
                        channel_id="alerts",
                        priority=priority
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound="default",
                            content_available=True,
                            badge=1
                        )
                    )
                )
            )

            # Send message
            response = messaging.send(message)
            logger.info(f"Successfully sent alert to device. Response: {response}")
            return True

        except Exception as e:
            logger.error(f"Failed to send alert notification: {e}")
            return False

    async def send_custom_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        priority: str = "normal"
    ) -> bool:
        """
        Send custom notification to patient's device

        Args:
            device_token: Firebase device token
            title: Notification title
            body: Notification body
            data: Custom data payload
            priority: Message priority (normal, high)

        Returns:
            True if sent successfully, False otherwise
        """
        if not self._initialized:
            logger.info(
                f"[MOCKED] Would send notification to device {device_token[:10]}..."
            )
            logger.info(f"[MOCKED] Notification: {title} - {body}")
            return True

        try:
            from firebase_admin import messaging

            # Create notification message
            message = messaging.Message(
                token=device_token,
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data={k: str(v) for k, v in (data or {}).items()},
                android=messaging.AndroidConfig(
                    priority=priority,
                    notification=messaging.AndroidNotification(
                        sound="default",
                        priority=priority
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound="default",
                            content_available=True
                        )
                    )
                )
            )

            # Send message
            response = messaging.send(message)
            logger.info(f"Successfully sent notification to device. Response: {response}")
            return True

        except Exception as e:
            logger.error(f"Failed to send custom notification: {e}")
            return False

    def is_initialized(self) -> bool:
        """Check if Firebase is properly initialized"""
        return self._initialized


# Create singleton instance
firebase_service = FirebaseService()
