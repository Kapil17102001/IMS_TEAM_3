# Email Service Setup

## Initial Authentication

Before using email functionality, you must authenticate once:

1. **Run the authentication script:**
   ```bash
   cd backend
   python authenticate_email.py
   ```

2. **Follow the prompts:**
   - Open the provided URL in your browser
   - Enter the device code shown
   - Sign in with your Microsoft 365 account
   - Grant permissions

3. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Configuration

Make sure your `.env` file contains:

```env
# Microsoft Graph Configuration
GRAPH_CLIENT_ID=your-client-id-here
GRAPH_TENANT_ID=consumers  # or your organization tenant ID
MAIL_USERNAME=your-email@domain.com
```

## Troubleshooting

- **"Authorization required" error**: Run `python authenticate_email.py` again
- **Token expired**: Delete `token_cache.bin` and re-authenticate
- **Network errors**: Ensure you have internet connectivity to login.microsoftonline.com
