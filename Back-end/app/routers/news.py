from typing import List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from ..schemas import (
    NewsCreate, NewsCreateBulk, NewsOut,
    EnvelopeSuccess, MetaSuccess, MetaPagination,
    CategoryOut, AgencyOut
)
from ..deps import get_db
from ..crud import create_news, list_news, list_categories, list_agencies
from ..security import require_ingest_api_key

router = APIRouter(prefix="/api", tags=["news"])

def _paginate_links(req: Request, *, limit: int, offset: int, total: int, count: int) -> MetaPagination:
    # Build next/prev hrefs preserving current query params
    def url_with(new_offset: int) -> str:
        from urllib.parse import urlencode
        qp = dict(req.query_params)
        qp.update({"limit": str(limit), "offset": str(max(new_offset, 0))})
        base = str(req.url).split("?")[0]
        return f"{base}?{urlencode(qp)}"

    next_href = ""
    prev_href = ""
    if offset + count < total:
        next_href = url_with(offset + limit)
    if offset > 0:
        prev_href = url_with(max(offset - limit, 0))

    return MetaPagination(
        next=next_href,
        prev=prev_href,
        current_page=count,
        total_items=total,
    )
@router.post("/news", response_model=EnvelopeSuccess, dependencies=[Depends(require_ingest_api_key)])
def ingest_news(item: NewsCreate, db: Session = Depends(get_db)):
    try:
        news, _ = create_news(
            db,
            title=item.title,
            content=item.content,
            image_url=item.image_url,
            category_id=item.category_id,
            agency_id=item.agency_id,
            pub_date=item.pubDate,
            link=item.link,
        )
        db.commit()          # <-- commit the transaction
        db.refresh(news)     # <-- reload with DB state (ids, etc.)
        return EnvelopeSuccess(meta=MetaSuccess(), data={"news": NewsOut.model_validate(news)})
    except Exception as e:
        db.rollback()        # <-- rollback on failure
        raise

@router.post("/news/bulk", response_model=EnvelopeSuccess, dependencies=[Depends(require_ingest_api_key)])
def ingest_news_bulk(payload: NewsCreateBulk, db: Session = Depends(get_db)):
    out: List[NewsOut] = []
    try:
        for item in payload.items:
            news, _ = create_news(
                db,
                title=item.title,
                content=item.content,
                image_url=item.image_url,
                category_id=item.category_id,
                agency_id=item.agency_id,
                pub_date=item.pubDate,
                link=item.link,
            )
            out.append(NewsOut.model_validate(news))
        db.commit()          # <-- one commit for the whole batch
        return EnvelopeSuccess(meta=MetaSuccess(), data={"news": out})
    except Exception:
        db.rollback()
        raise

@router.get("/news", response_model=EnvelopeSuccess)
def get_news(
    request: Request,
    db: Session = Depends(get_db),
    category_id: int | None = Query(None, ge=1, description="Filter by category id"),
    agency_id: int | None = Query(None, ge=1, description="Filter by agency id"),
    category: str | None = Query(None, description="Filter by category name"),
    agency: str | None = Query(None, description="Filter by agency name"),
    q: str | None = Query(None, description="Search title/content (LIKE)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    total, items = list_news(
        db,
        category=category,
        agency=agency,
        category_id=category_id,
        agency_id=agency_id,
        q=q,
        limit=limit,
        offset=offset,
    )
    pagination = _paginate_links(request, limit=limit, offset=offset, total=total, count=len(items))
    items_out = [NewsOut.model_validate(n) for n in items]
    return EnvelopeSuccess(meta=MetaSuccess(pagination=pagination), data={"news": items_out})

@router.get("/categories", response_model=EnvelopeSuccess)
def get_categories(db: Session = Depends(get_db)):
    cats = list_categories(db)
    return EnvelopeSuccess(meta=MetaSuccess(), data={"categories": [CategoryOut.model_validate(c) for c in cats]})

@router.get("/agencies", response_model=EnvelopeSuccess)
def get_agencies(db: Session = Depends(get_db)):
    ags = list_agencies(db)
    return EnvelopeSuccess(meta=MetaSuccess(), data={"agencies": [AgencyOut.model_validate(a) for a in ags]})
