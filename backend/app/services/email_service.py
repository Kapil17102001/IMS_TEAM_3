import msal
import requests
import os
import atexit
import json
from typing import List, Optional
from app.core.config import settings
from app.core.logger import logger

class EmailService:
    def __init__(self):
        self.client_id = settings.GRAPH_CLIENT_ID
        self.tenant_id = settings.GRAPH_TENANT_ID
        self.scopes = settings.GRAPH_USER_SCOPES
        self.username = settings.MAIL_USERNAME
        
        # Token Cache Setup
        self.cache_file = "token_cache.bin"
        self.cache = msal.SerializableTokenCache()
        
        if os.path.exists(self.cache_file):
            self.cache.deserialize(open(self.cache_file, "r").read())
            
        # Register a callback to save the cache on exit
        atexit.register(lambda: 
            open(self.cache_file, "w").write(self.cache.serialize()) 
            if self.cache.has_state_changed else None
        )

        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        
        self.app = msal.PublicClientApplication(
            self.client_id, 
            authority=self.authority,
            token_cache=self.cache
        )

    def _get_access_token(self) -> Optional[str]:
        """
        Acquire token for Graph API.
        Attempts to acquire token silently from cache.
        """
        accounts = self.app.get_accounts()
        result = None
        
        if accounts:
            # Try to get token silently using the first available account
            # (Or filter by self.username if multiple accounts exist)
            chosen_account = next((a for a in accounts if a.get("username") == self.username), accounts[0])
            result = self.app.acquire_token_silent(self.scopes, account=chosen_account)

        if result and "access_token" in result:
            return result["access_token"]
        
        logger.error("No valid token found in cache. Please run the authentication setup manually.")
        return None

    def authenticat_interactive(self):
        """
        Run this method manually (e.g., via a script) to perform the initial Device Code authentication.
        """
        flow = self.app.initiate_device_flow(scopes=self.scopes)
        if "user_code" not in flow:
            logger.error(f"Device flow initiation failed. Response: {json.dumps(flow, indent=2)}")
            raise ValueError(f"Failed to create device flow. Error: {flow.get('error_description', 'Check Client ID and Tenant config')}")
            
        print("\n" + "="*60)
        print("AUTHENTICATION REQUIRED")
        print(f"1. Open this URL in your browser: {flow['verification_uri']}")
        print(f"2. Enter this code: {flow['user_code']}")
        print("="*60 + "\n")
        
        # Calculate expiration
        # Block until user logs in
        result = self.app.acquire_token_by_device_flow(flow)
        
        if "access_token" in result:
            print("Authentication successful! Token cached.")
            return True
        else:
            print(f"Authentication failed: {result.get('error_description')}")
            return False

    async def send_email(
        self,
        email_to: List[str],
        subject: str,
        html_content: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        content_type: str = "HTML"
    ) -> bool:
        """
        Send an email using Microsoft Graph API
        """
        access_token = self._get_access_token()
        if not access_token:
            logger.error("Cannot send email: Authorization required.")
            return False

        to_recipients = [{"emailAddress": {"address": email}} for email in email_to]
        cc_recipients = [{"emailAddress": {"address": email}} for email in (cc or [])]
        bcc_recipients = [{"emailAddress": {"address": email}} for email in (bcc or [])]

        email_data = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": content_type,
                    "content": html_content
                },
                "toRecipients": to_recipients,
                "ccRecipients": cc_recipients,
                "bccRecipients": bcc_recipients
            },
            "saveToSentItems": "true"
        }

        endpoint = "https://graph.microsoft.com/v1.0/me/sendMail"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(endpoint, headers=headers, json=email_data)
            
            if response.status_code == 202:
                logger.info(f"Email sent successfully to {email_to}")
                return True
            else:
                logger.error(f"Failed to send email. Status: {response.status_code}. Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Exception sending email via Graph API: {str(e)}")
            return False

email_service = EmailService()
