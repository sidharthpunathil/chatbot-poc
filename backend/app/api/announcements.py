from fastapi import APIRouter, HTTPException
from ..services.announcement_service import scrape_announcements

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("/")
async def get_announcements():
    """Scrape and return current announcements from the college website."""
    try:
        announcements = scrape_announcements()
        return {
            "total": len(announcements),
            "announcements": announcements,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail="Failed to fetch announcements")
