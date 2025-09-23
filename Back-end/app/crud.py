from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from . import models

def find_duplicate_news(db: Session, *, link: Optional[str], title: str, category_id: int) -> Optional[models.News]:
    # Prefer link match; else (title + category)
    if link:
        by_link = db.execute(select(models.News).where(models.News.link == link)).scalar_one_or_none()
        if by_link:
            return by_link
    by_title_cat = db.execute(
        select(models.News).where(
            func.lower(models.News.title) == title.lower(),
            models.News.category_id == category_id,
        )
    ).scalar_one_or_none()
    return by_title_cat

def create_news(
    db: Session,
    *,
    title: str,
    content: str,
    image_url: Optional[str],
    category_id: int,
    agency_id: int,
    pub_date: Optional[str],
    link: Optional[str],
) -> Tuple[models.News, bool]:
    existing = find_duplicate_news(db, link=link, title=title, category_id=category_id)
    if existing:
        # Optionally backfill missing fields if new data is richer
        changed = False
        if not existing.image_url and image_url:
            existing.image_url = image_url
            changed = True
        if not existing.pubDate and pub_date:
            existing.pubDate = pub_date
            changed = True
        if not existing.link and link:
            existing.link = link
            changed = True
        if changed:
            db.add(existing)
        return existing, False

    news = models.News(
        title=title.strip(),
        content=content.strip(),
        image_url=image_url,
        category_id=category_id,
        agency_id=agency_id,
        pubDate=pub_date,
        link=link,
    )
    db.add(news)
    db.flush()
    db.refresh(news)
    return news, True

from sqlalchemy.orm import Session, joinedload

def list_news(
    db: Session,
    *,
    category: Optional[str] = None,
    agency: Optional[str] = None,
    category_id: Optional[int] = None,
    agency_id: Optional[int] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    stmt = select(models.News).join(models.News.category).join(models.News.agency)

    if category_id is not None:
        stmt = stmt.where(models.News.category_id == category_id)
    if agency_id is not None:
        stmt = stmt.where(models.News.agency_id == agency_id)

    if category:
        stmt = stmt.where(func.lower(models.Category.name) == category.lower())
    if agency:
        stmt = stmt.where(func.lower(models.Agency.name) == agency.lower())

    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            func.lower(models.News.title).like(like) | func.lower(models.News.content).like(like)
        )

    total = db.execute(stmt.with_only_columns(func.count()).order_by(None)).scalar() or 0
    # Order by most recent publication date first; fall back to id for stable ordering
    stmt = stmt.order_by(models.News.pubDate.desc(), models.News.id.desc()).limit(limit).offset(offset)

    rows = db.execute(stmt).scalars().all()
    for n in rows:
        _ = n.category, n.agency
    return total, rows

def list_categories(db: Session):
    return db.execute(select(models.Category).order_by(models.Category.name.asc())).scalars().all()

def list_agencies(db: Session):
    return db.execute(select(models.Agency).order_by(models.Agency.name.asc())).scalars().all()
