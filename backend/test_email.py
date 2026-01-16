import asyncio
import sys
import os

# Add the current directory to sys.path to ensure we can import 'app' modules correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import email_service

async def main():
    print("--- Email Service Test Utility ---")
    print("This script will attempt to send a test email using the configuration in app/core/config.py")
    
    # Default recipient to the same address sending it, or allow override
    recipient = input("Enter recipient email (press Enter to use 'example@wissen.com'): ").strip()
    if not recipient:
        recipient = "example@wissen.com"

    print(f"\nSending test email to: {recipient}...")
    print(f"Service: Microsoft Graph API")
    print(f"Using Client ID: ...{email_service.client_id[-4:] if email_service.client_id else 'None'}")
    print(f"From Account: {email_service.username}")

    # Check if we have a token valid, if not, prompt for setup
    if not email_service._get_access_token():
        print("\n[!] No valid access token found in cache.")
        choice = input("Do you want to perform the One-Time Device Code Authentication now? (y/n): ")
        if choice.lower() == 'y':
            email_service.authenticat_interactive()
    
    html_content = """
    <html>
        <body>
            <h1 style="color: #2c3e50;">Test Email from IMS</h1>
            <p>This is a test email sent from the standalone test script.</p>
            <hr>
            <p style="font-size: 0.8em; color: #7f8c8d;">Timestamp: {}</p>
        </body>
    </html>
    """.format(asyncio.get_event_loop().time())

    try:
        success = await email_service.send_email(
            email_to=[recipient],
            subject="IMS Email Service Test",
            html_content=html_content
        )

        if success:
            print("\n[SUCCESS] Test email sent successfully!")
        else:
            print("\n[FAILURE] Failed to send test email. Please check the logs/app.log file for error details.")
            
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Windows-specific event loop policy might be needed for some python versions/environments, 
    # but standard run should be fine for simple scripts.
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(main())
