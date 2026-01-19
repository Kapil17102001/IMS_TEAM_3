"""
Email Authentication Setup Script

Run this script ONCE before starting the server to authenticate
and generate the token_cache.bin file for Microsoft Graph API.

Usage:
    python authenticate_email.py
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import email_service
from app.core.logger import logger

def main():
    print("\n" + "="*70)
    print("EMAIL SERVICE AUTHENTICATION SETUP")
    print("="*70)
    print("\nThis will authenticate your Microsoft 365 account for sending emails.")
    print("You only need to do this once.\n")
    
    try:
        success = email_service.authenticat_interactive()
        
        if success:
            print("\n" + "="*70)
            print("✓ Authentication successful!")
            print("✓ Token has been cached to token_cache.bin")
            print("✓ You can now start the uvicorn server")
            print("="*70 + "\n")
            return 0
        else:
            print("\n" + "="*70)
            print("✗ Authentication failed!")
            print("Please check your credentials and try again.")
            print("="*70 + "\n")
            return 1
            
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        print(f"\n✗ Error: {str(e)}\n")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
