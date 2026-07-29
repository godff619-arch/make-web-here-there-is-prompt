from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.content import Setting, Branding, FeatureFlag, HomepageSection, generate_uuid
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).all()
    return {s.key: s.value for s in settings}


@router.put("")
def update_settings(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    for key, value in data.items():
        s = db.query(Setting).filter(Setting.key == key).first()
        if s:
            s.value = value
        else:
            s = Setting(id=generate_uuid(), key=key, value=value)
            db.add(s)
    db.commit()
    return {"message": "Settings updated"}


@router.get("/branding")
def get_branding(db: Session = Depends(get_db)):
    b = db.query(Branding).first()
    if not b:
        return {
            "site_name": "Universal AI Studio",
            "short_name": "AI Studio",
            "primary_color": "#6366f1",
            "accent_color": "#6366f1",
        }
    return {
        "site_name": b.site_name, "short_name": b.short_name,
        "logo_url": b.logo_url, "logo_dark_url": b.logo_dark_url, "logo_light_url": b.logo_light_url,
        "favicon_url": b.favicon_url, "login_background": b.login_background,
        "primary_color": b.primary_color, "secondary_color": b.secondary_color, "accent_color": b.accent_color,
        "font_family": b.font_family, "footer_text": b.footer_text, "copyright": b.copyright,
        "meta_title": b.meta_title, "meta_description": b.meta_description,
        "is_white_label": b.is_white_label, "custom_domain": b.custom_domain,
    }


@router.put("/branding")
def update_branding(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    b = db.query(Branding).first()
    if not b:
        b = Branding(id=generate_uuid())
        db.add(b)
    for k, v in data.items():
        if hasattr(b, k) and k != "id":
            setattr(b, k, v)
    db.commit()
    return {"message": "Branding updated"}


@router.get("/features")
def list_features(db: Session = Depends(get_db)):
    features = db.query(FeatureFlag).all()
    return [{"id": f.id, "name": f.name, "slug": f.slug, "is_enabled": f.is_enabled, "status": f.status, "membership_required": f.membership_required, "role_required": f.role_required} for f in features]


@router.put("/features/{feature_id}")
def toggle_feature(feature_id: str, is_enabled: Optional[bool] = None, status: Optional[str] = None, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    f = db.query(FeatureFlag).filter(FeatureFlag.id == feature_id).first()
    if not f:
        raise HTTPException(status_code=404)
    if is_enabled is not None:
        f.is_enabled = is_enabled
    if status is not None:
        f.status = status
    db.commit()
    return {"message": "Updated"}


@router.get("/homepage")
def get_homepage(db: Session = Depends(get_db)):
    sections = db.query(HomepageSection).filter(HomepageSection.is_enabled == True, HomepageSection.status == "published").order_by(HomepageSection.sort_order).all()
    return [{"id": s.id, "name": s.name, "slug": s.slug, "type": s.type, "title": s.title, "subtitle": s.subtitle, "description": s.description, "content": s.content, "buttons": s.buttons, "images": s.images, "background": s.background, "animation": s.animation} for s in sections]


@router.post("/homepage")
def create_homepage_section(name: str, slug: str, type: str = "hero", db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    s = HomepageSection(id=generate_uuid(), name=name, slug=slug, type=type)
    db.add(s)
    db.commit()
    return {"id": s.id, "name": s.name}


@router.put("/homepage/{section_id}")
def update_homepage_section(section_id: str, data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    s = db.query(HomepageSection).filter(HomepageSection.id == section_id).first()
    if not s:
        raise HTTPException(status_code=404)
    for k, v in data.items():
        if hasattr(s, k) and k != "id":
            setattr(s, k, v)
    db.commit()
    return {"message": "Updated"}
