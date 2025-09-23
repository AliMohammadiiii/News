from typing import Optional, List, Any
from pydantic import BaseModel, Field
import uuid

# ---------- Inputs ----------
class NewsCreate(BaseModel):
    title: str = Field(..., max_length=255)
    content: str
    image_url: Optional[str] = None
    category_id: int = Field(..., description="Category id")
    agency_id: int = Field(..., description="Agency id")
    pubDate: Optional[int] = None
    link: Optional[str] = None

class NewsCreateBulk(BaseModel):
    items: List[NewsCreate]

# ---------- Entity Outputs ----------
class CategoryOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class AgencyOut(BaseModel):
    id: int
    name: str
    website: Optional[str] = None
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class NewsOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    image_url: Optional[str] = None
    pubDate: Optional[int] = None
    link: Optional[str] = None
    category: CategoryOut
    agency: AgencyOut
    class Config:
        from_attributes = True

# ---------- Unified Envelope (per injast protocol) ----------
class ErrorField(BaseModel):
    field: str
    message: str

class MetaPagination(BaseModel):
    next: str
    prev: str
    current_page: int
    total_items: int

class MetaSuccess(BaseModel):
    success: bool = True
    pagination: Optional[MetaPagination] | None = None

class MetaError(BaseModel):
    success: bool = False
    error_code: str
    error_help: str
    error_fields: List[ErrorField] = []

class EnvelopeSuccess(BaseModel):
    meta: MetaSuccess
    data: Any

class EnvelopeError(BaseModel):
    meta: MetaError
    message: str

# Convenience internal struct (not returned directly anymore)
class NewsListOut(BaseModel):
    total: int
    items: List[NewsOut]
