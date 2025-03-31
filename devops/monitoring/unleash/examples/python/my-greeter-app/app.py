import os
import logging
import atexit
from flask import Flask, request
from UnleashClient import UnleashClient
from UnleashClient.strategies import Strategy
from dotenv import load_dotenv

# --- Load Configuration ---
load_dotenv()

UNLEASH_URL = os.getenv("UNLEASH_SERVER_URL")
UNLEASH_APP_NAME = os.getenv("UNLEASH_APP_NAME")
UNLEASH_ENV = os.getenv("UNLEASH_ENVIRONMENT")
UNLEASH_TOKEN = os.getenv("UNLEASH_API_TOKEN")

# --- Basic Logging Setup ---
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Unleash Client Initialization ---
# Define a fallback function for safety
def fallback_feature_check(feature_name: str, context: dict) -> bool:
    log.warning(f"Unleash fallback triggered for feature: {feature_name}")
    return False # Default to the old/safe behavior

headers = {"Authorization": UNLEASH_TOKEN}

# Initialize Unleash Client
# Note: Ensure required env vars are present before initializing
if not all([UNLEASH_URL, UNLEASH_APP_NAME, UNLEASH_ENV, UNLEASH_TOKEN]):
     log.error("Missing required Unleash environment variables!")
     # Handle this appropriately - exit or run without Unleash
     # For demo, we'll let it potentially fail during init
     unleash_client = None # Indicate client failed to initialize
else:
    try:
        unleash_client = UnleashClient(
            url=UNLEASH_URL,
            app_name=UNLEASH_APP_NAME,
            environment=UNLEASH_ENV,
            instance_id="my-py-instance-1", # Optional but good practice
            custom_headers=headers,
            refresh_interval=5, # Check for updates every 5 seconds
            # You can add custom strategies here if needed
            # strategies={}
        )

        # Optional: Register listeners for events
        def ready_listener():
            log.info("✅ Unleash Client is ready!")
        def error_listener(error_message):
            log.error(f"Unleash Error: {error_message}")
        def warning_listener(warning_message):
            log.warning(f"Unleash Warning: {warning_message}")

        unleash_client.subscribe("ready", ready_listener)
        unleash_client.subscribe("error", error_listener)
        unleash_client.subscribe("warn", warning_listener)

        # IMPORTANT: Initialize the client (starts background thread for polling)
        unleash_client.initialize_client()
        log.info(f"Unleash client initializing for environment: {UNLEASH_ENV}...")

        # Register a function to destroy the client on exit
        atexit.register(unleash_client.destroy)

    except Exception as e:
        log.error(f"Failed to initialize Unleash Client: {e}")
        unleash_client = None # Ensure client is None if init fails


# --- Flask Route ---
@app.route('/')
def home():
    if not unleash_client:
         # Handle case where Unleash didn't initialize
         greeting = "Hi there, welcome. (Unleash client not available)"
         return f"<h1>{greeting}</h1>"

    # Get userId from query parameter, default to 'anonymous'
    user_id = request.args.get('userId', 'anonymous')

    # --- Unleash Context ---
    # Keys should match what your strategies expect (e.g., 'userId')
    context = {
        'userId': user_id
        # You can add other context fields:
        # 'sessionId': request.cookies.get('session_id'),
        # 'remoteAddress': request.remote_addr,
        # 'properties': {'userTier': 'premium'}
    }
    # -----------------------

    # --- Check the Feature Toggle ---
    # is_enabled(toggle_name, context, fallback_function)
    use_new_greeter = unleash_client.is_enabled(
        "newGreeterMessage",
        context=context,
        fallback_function=fallback_feature_check # Use the defined fallback
    )
    # ------------------------------

    # Determine the greeting message
    if use_new_greeter:
        log.info(f"User '{user_id}' - Serving NEW greeting.")
        greeting = f"👋 Hello there from Python, {user_id}! Welcome to the enhanced experience!"
    else:
        log.info(f"User '{user_id}' - Serving OLD greeting.")
        greeting = f"Hi {user_id}, welcome from Python."

    return f"<h1>{greeting}</h1>"

# --- Run the App ---
if __name__ == '__main__':
    # Use a port other than 3000 if the Node.js app might be running
    app.run(host='0.0.0.0', port=5000, debug=False) # debug=True reloads, might interfere with SDK threads sometimes