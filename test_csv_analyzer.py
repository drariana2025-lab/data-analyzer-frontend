import pandas as pd
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from backend.services.file_analyzer import FileAnalyzer

def test_csv_robustness():
    # 1. Create a CSV with semicolon and cp1251 encoding
    test_file = "test_robust.csv"
    data = "Город;Выручка;Дата\nМосква;100;2023-01-01\nПитер;200;2023-01-02"
    
    with open(test_file, "w", encoding="cp1251") as f:
        f.write(data)
    
    print(f"Testing with CP1251 and semicolon...")
    result = FileAnalyzer.analyze(test_file)
    
    if "error" in result:
        print(f"FAILED: {result['error']}")
    else:
        print(f"SUCCESS: Found {result['row_count']} rows")
        print(f"Columns: {list(result['columns_info'].keys())}")
    
    os.remove(test_file)

if __name__ == "__main__":
    test_csv_robustness()
