import os
import django
import textwrap

# --- Setup Django ---
# This allows the script to access your project's settings (like the API key)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medilinq_config.settings')
django.setup()
# --- End of Setup ---

from django.conf import settings
import google.generativeai as genai

print("\n--- Starting AI Model Check ---")

try:
    # 1. Get the API key from your settings.py
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        print("ERROR: GOOGLE_API_KEY is not set in medilinq_config/settings.py")
        exit()

    # 2. Configure the client
    genai.configure(api_key=api_key)
    
    print("Successfully configured API key. Fetching available models...\n")

    # 3. Call "ListModels"
    for model in genai.list_models():
        # 4. Check which models support 'generateContent' (what we need)
        if 'generateContent' in model.supported_generation_methods:
            print(f"--- Found Supported Model ---")
            print(f"Model Name: {model.name}")
            print(f"Description: {model.description}\n")

    print("--- Model Check Complete ---")
    print("Please copy the output above (especially the 'Model Name') and paste it back.")

except Exception as e:
    print(f"An error occurred while checking models: {e}")