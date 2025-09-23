import uuid as _uuid
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    news = relationship("News", back_populates="category")

class Agency(Base):
    __tablename__ = "agencies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    website = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    news = relationship("News", back_populates="agency")

class News(Base):
    __tablename__ = "news"
    id = Column(UUID(as_uuid=True), unique=True, primary_key=True, nullable=False, default=_uuid.uuid4, index=True)

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    pubDate = Column(Integer, nullable=True)
    link = Column(Text, nullable=True)

    category = relationship("Category", back_populates="news")
    agency = relationship("Agency", back_populates="news")
