import os
import shutil
from backend.core.config import settings

def test_save():
    print(f"Current Directory: {os.getcwd()}")
    print(f"Target Upload Dir: {settings.UPLOAD_DIR}")
    
    if not os.path.exists(settings.UPLOAD_DIR):
        print(f"Directory {settings.UPLOAD_DIR} does NOT exist. Creating...")
        os.makedirs(settings.UPLOAD_DIR)
    else:
        print(f"Directory {settings.UPLOAD_DIR} exists.")
        
    test_file = "test_upload.txt"
    with open(test_file, "w") as f:
        f.write("Hello World")
        
    target_path = os.path.join(settings.UPLOAD_DIR, "debug_test.txt")
    try:
        shutil.copy(test_file, target_path)
        print(f"SUCCESS: File saved to {target_path}")
    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    test_save()
