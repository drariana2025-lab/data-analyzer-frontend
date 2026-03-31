import pandas as pd
import json
import os
from typing import Dict, List, Any

class FileAnalyzer:
    @staticmethod
    def analyze(file_path: str) -> Dict[str, Any]:
        """
        Analyzes a file (CSV, Excel, JSON) using pandas and returns metadata for the dashboard.
        """
        ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if ext == '.csv':
                # Try UTF-8 first, with auto-separator detection
                # engine='python' is needed for sep=None (detecting , or ;)
                try:
                    df = pd.read_csv(file_path, sep=None, engine='python', encoding='utf-8')
                except UnicodeDecodeError:
                    # Try Russian encoding (common in Excel exports)
                    try:
                        df = pd.read_csv(file_path, sep=None, engine='python', encoding='cp1251')
                    except:
                        # Fallback to general latin1
                        df = pd.read_csv(file_path, sep=None, engine='python', encoding='latin1')
            elif ext in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            elif ext == '.json':
                df = pd.read_json(file_path)
            else:
                raise ValueError(f"Формат файла '{ext}' не поддерживается системой.")
        except Exception as e:
            return {"error": f"Ошибка чтения файла: {str(e)}"}

        if df.empty:
            return {"error": "File is empty"}

        # 1. Structure (Columns and Types)
        columns_info = {}
        for col in df.columns:
            dtype = str(df[col].dtype)
            if "int" in dtype or "float" in dtype:
                columns_info[col] = "numeric"
            elif "datetime" in dtype or col.lower() in ['date', 'time', 'год', 'дата']:
                columns_info[col] = "temporal"
                # Try to convert if it's not already datetime
                if not "datetime" in dtype:
                    try:
                        df[col] = pd.to_datetime(df[col])
                        columns_info[col] = "temporal"
                    except:
                        pass
            else:
                columns_info[col] = "categorical"

        # 2. Statistics
        statistics = {}
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            clean_col = df[col].dropna()
            if not clean_col.empty:
                statistics[col] = {
                    "min": float(clean_col.min()),
                    "max": float(clean_col.max()),
                    "mean": float(clean_col.mean()),
                    "median": float(clean_col.median()),
                    "std": float(clean_col.std()) if len(clean_col) > 1 else 0
                }
            else:
                statistics[col] = {
                    "min": None, "max": None, "mean": None, "median": None, "std": None
                }

        # 3. Chart Configurations (Automatic suggestion)
        chart_configs = []
        
        # Suggest Time Series if date/year and numeric exists
        temporal_cols = [c for c, t in columns_info.items() if t == "temporal"]
        if temporal_cols and len(numeric_cols) > 0:
            chart_configs.append({
                "id": "time_series_auto",
                "title": f"Динамический анализ: {numeric_cols[0]} во времени",
                "type": "line",
                "x": temporal_cols[0],
                "y": numeric_cols[0]
            })

        # Suggest Bar Chart for categorical data
        cat_cols = [c for c, t in columns_info.items() if t == "categorical"]
        if cat_cols and len(numeric_cols) > 0:
            chart_configs.append({
                "id": "bar_auto",
                "title": f"Динамический анализ: {numeric_cols[0]} по {cat_cols[0]}",
                "type": "bar",
                "x": cat_cols[0],
                "y": numeric_cols[0]
            })

        # If we have at least 2 numeric columns, suggest correlation
        if len(numeric_cols) >= 2:
            chart_configs.append({
                "id": "scatter_auto",
                "title": f"Корреляция: {numeric_cols[0]} и {numeric_cols[1]}",
                "type": "scatter",
                "x": numeric_cols[0],
                "y": numeric_cols[1]
            })

        # 4. Final Cleanup (Replace NaN with None for JSON compliance)
        import numpy as np
        
        # Convert to object type first so None is accepted in numeric columns
        df_preview = df.head(10).astype(object)
        df_preview = df_preview.where(pd.notnull(df_preview), None)
        preview = df_preview.to_dict(orient='records')

        result = {
            "columns_info": columns_info,
            "statistics": statistics,
            "chart_configs": chart_configs,
            "row_count": len(df),
            "preview": preview
        }

        # Recursive cleaning function for any nested NaNs
        def sanitize(obj):
            if isinstance(obj, dict):
                return {k: sanitize(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize(x) for x in obj]
            elif isinstance(obj, float) and np.isnan(obj):
                return None
            return obj

        return sanitize(result)
