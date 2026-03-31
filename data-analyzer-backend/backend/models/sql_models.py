from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    files = relationship("FileRecord", back_populates="user")

class FileRecord(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")  # pending, analyzing, completed, failed
    
    user = relationship("User", back_populates="files")
    analysis = relationship("AnalysisResult", back_populates="file", uselist=False)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    
    columns_info = Column(JSON)      # {column_name: data_type}
    statistics = Column(JSON)        # {column: {min, max, mean}}
    chart_configs = Column(JSON)     # [{type: "bar", x: "col1", y: "col2"}]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    file = relationship("FileRecord", back_populates="analysis")

def get_db_schema():
    return Base.metadata
