from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from ..services.scraper_service import scrape_url
from ..core.admin import admin_required

router = APIRouter(prefix="/scraper", tags=["Scraper"])


class ScrapeRequest(BaseModel):
    url: HttpUrl


@router.post("/")
async def scrape_page(req: ScrapeRequest, admin=Depends(admin_required)):
    """Scrape a college website page and return its text content."""
    try:
        return scrape_url(str(req.url))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch the page")
