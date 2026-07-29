from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User, Membership, Role, Session as UserSession, generate_uuid
from app.models.content import Conversation, Message, Notification, File, Announcement
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def admin_dashboard(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True, User.is_banned != True).scalar() or 0
    total_conversations = db.query(func.count(Conversation.id)).scalar() or 0
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    now = datetime.utcnow()
    today_conversations = db.query(func.count(Conversation.id)).filter(Conversation.created_at >= now - timedelta(days=1)).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "today_conversations": today_conversations,
        "system_status": "healthy",
    }


@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%") | User.display_name.ilike(f"%{search}%"))
    if role:
        q = q.filter(User.role == role)
    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "users": [{"id": u.id, "email": u.email, "display_name": u.display_name, "role": u.role, "is_active": u.is_active, "is_verified": u.is_verified, "created_at": u.created_at.isoformat()} for u in users],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: str,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_suspended: Optional[bool] = None,
    is_banned: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    display_name: Optional[str] = None,
    membership_id: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role is not None:
        user.role = role
    if is_active is not None:
        user.is_active = is_active
    if is_suspended is not None:
        user.is_suspended = is_suspended
    if is_banned is not None:
        user.is_banned = is_banned
    if is_verified is not None:
        user.is_verified = is_verified
    if display_name is not None:
        user.display_name = display_name
    if membership_id is not None:
        user.membership_id = membership_id
    db.commit()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot delete owner")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/roles")
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    return [{"id": r.id, "name": r.name, "slug": r.slug, "description": r.description, "permissions": r.permissions} for r in roles]


@router.post("/roles")
def create_role(name: str, slug: str, permissions: list = [], description: Optional[str] = None, db: Session = Depends(get_db)):
    role = Role(id=generate_uuid(), name=name, slug=slug, description=description, permissions=permissions)
    db.add(role)
    db.commit()
    return {"id": role.id, "name": role.name}


@router.get("/memberships")
def list_memberships(db: Session = Depends(get_db)):
    plans = db.query(Membership).order_by(Membership.sort_order).all()
    return [{"id": p.id, "name": p.name, "slug": p.slug, "description": p.description, "price_monthly": p.price_monthly, "price_yearly": p.price_yearly, "features": p.features, "limits": p.limits, "is_active": p.is_active} for p in plans]


@router.post("/memberships")
def create_membership(
    name: str,
    slug: str,
    description: Optional[str] = None,
    price_monthly: float = 0,
    price_yearly: float = 0,
    features: dict = {},
    limits: dict = {},
    db: Session = Depends(get_db),
):
    plan = Membership(id=generate_uuid(), name=name, slug=slug, description=description, price_monthly=price_monthly, price_yearly=price_yearly, features=features, limits=limits)
    db.add(plan)
    db.commit()
    return {"id": plan.id, "name": plan.name}


@router.put("/memberships/{plan_id}")
def update_membership(plan_id: str, data: dict, db: Session = Depends(get_db)):
    plan = db.query(Membership).filter(Membership.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.items():
        if hasattr(plan, k):
            setattr(plan, k, v)
    db.commit()
    return {"message": "Updated"}


@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db)):
    items = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [{"id": a.id, "title": a.title, "content": a.content, "type": a.type, "is_active": a.is_active} for a in items]


@router.post("/announcements")
def create_announcement(title: str, content: str, type: str = "banner", db: Session = Depends(get_db)):
    a = Announcement(id=generate_uuid(), title=title, content=content, type=type)
    db.add(a)
    db.commit()
    return {"id": a.id, "title": a.title}
