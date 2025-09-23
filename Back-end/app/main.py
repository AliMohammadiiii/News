from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .database import engine, Base
from .routers import news as news_router
from .schemas import EnvelopeError, MetaError, ErrorField

APP_NAME = "Injast News Service"

app = FastAPI(
    title=APP_NAME,
    description="Ingestion + read APIs for categorized news. POST endpoints secured via X-API-Key.",
    version="1.0.0",
    contact={"name": "injast.life", "url": "https://injast.life"},
    license_info={"name": "Proprietary"},
    openapi_url="/openapi.json",  # OpenAPI spec
    docs_url="/docs",             # Swagger UI
    redoc_url="/redoc",           # ReDoc
)

# CORS (tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create tables on startup (dev). Prefer Alembic for prod.
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# ---------- Error envelope handlers ----------
ERROR_HELP_BASE = "https://injast.life/help/errors/"

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = {403: "Forbidden", 404: "NotFound", 401: "Unauthorized"}.get(exc.status_code, "HTTPError")
    env = EnvelopeError(
        meta=MetaError(success=False, error_code=code, error_help=f"{ERROR_HELP_BASE}{code}", error_fields=[]),
        message=str(exc.detail),
    )
    return JSONResponse(status_code=exc.status_code, content=env.model_dump())

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    fields: list[ErrorField] = []
    try:
        for err in exc.errors():
            loc = ".".join(str(p) for p in err.get("loc", []) if p != "body")
            fields.append(ErrorField(field=loc or "body", message=err.get("msg", "Invalid")))
    except Exception:
        fields = []
    env = EnvelopeError(
        meta=MetaError(success=False, error_code="ValidationError", error_help=f"{ERROR_HELP_BASE}ValidationError", error_fields=fields),
        message="Request validation failed",
    )
    return JSONResponse(status_code=422, content=env.model_dump())

# Routers
app.include_router(news_router.router)

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/")
def index():
    return {"service": APP_NAME, "docs": "/docs", "openapi": "/openapi.json"}
