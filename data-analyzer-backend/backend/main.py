from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from backend.core.config import settings
from backend.api.upload_routes import router as upload_router
from backend.models.sql_models import engine, Base

# Initialize Database (Create tables if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for Debugging
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

# Routes
app.include_router(upload_router, prefix="/api", tags=["upload"])

@app.get("/")
async def root():
    return {
        "message": "Universal Disease Monitoring Backend is running",
        "author": "Antigravity",
        "docs": "/docs"
    }

if __name__ == "__main__":
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
        
    # In a real environment, you'd run `uvicorn main:app --reload`
    uvicorn.run(app, host="0.0.0.0", port=8000)
