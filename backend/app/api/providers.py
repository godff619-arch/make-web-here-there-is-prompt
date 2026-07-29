from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import AIProvider, BaseURL, AIModel, APIKeyVault, AIMode, UserProvider, generate_uuid
from app.models.user import User
from app.api.deps import get_current_user, get_current_admin
from app.core.config import settings
import httpx
import json

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("")
def list_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    providers = db.query(AIProvider).filter(AIProvider.is_enabled == True).order_by(AIProvider.sort_order).all()
    return [{
        "id": p.id, "name": p.name, "slug": p.slug, "description": p.description,
        "logo_url": p.logo_url, "category": p.category, "tags": p.tags,
        "color": p.color, "api_type": p.api_type, "priority": p.priority,
        "is_enabled": p.is_enabled, "is_maintenance": p.is_maintenance,
    } for p in providers]


@router.post("")
def create_provider(
    name: str, slug: str, description: Optional[str] = None,
    api_type: str = "openai_compatible", db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    p = AIProvider(id=generate_uuid(), name=name, slug=slug, description=description, api_type=api_type)
    db.add(p)
    db.commit()
    return {"id": p.id, "name": p.name}


@router.put("/{provider_id}")
def update_provider(provider_id: str, data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    p = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.items():
        if hasattr(p, k):
            setattr(p, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{provider_id}")
def delete_provider(provider_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    p = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404)
    db.delete(p)
    db.commit()
    return {"message": "Deleted"}


@router.get("/{provider_id}/models")
def list_models(provider_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    models = db.query(AIModel).filter(AIModel.provider_id == provider_id, AIModel.is_enabled == True).order_by(AIModel.sort_order).all()
    return [{
        "id": m.id, "name": m.name, "alias": m.alias, "description": m.description,
        "context_window": m.context_window, "max_tokens": m.max_tokens,
        "supports_streaming": m.supports_streaming, "supports_vision": m.supports_vision,
        "supports_function_calling": m.supports_function_calling, "supports_json_mode": m.supports_json_mode,
        "supports_reasoning": m.supports_reasoning, "category": m.category, "tags": m.tags,
        "pricing_prompt_per_1k": m.pricing_prompt_per_1k, "pricing_completion_per_1k": m.pricing_completion_per_1k,
    } for m in models]


@router.post("/{provider_id}/models")
def add_model(provider_id: str, name: str, context_window: int = 4096, max_tokens: int = 4096, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    p = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    m = AIModel(id=generate_uuid(), provider_id=provider_id, name=name, context_window=context_window, max_tokens=max_tokens)
    db.add(m)
    db.commit()
    return {"id": m.id, "name": m.name}


@router.put("/{provider_id}/models/{model_id}")
def update_model(provider_id: str, model_id: str, data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    m = db.query(AIModel).filter(AIModel.id == model_id, AIModel.provider_id == provider_id).first()
    if not m:
        raise HTTPException(status_code=404)
    for k, v in data.items():
        if hasattr(m, k):
            setattr(m, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{provider_id}/models/{model_id}")
def delete_model(provider_id: str, model_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    m = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404)
    db.delete(m)
    db.commit()
    return {"message": "Deleted"}


@router.get("/{provider_id}/base-urls")
def list_base_urls(provider_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    urls = db.query(BaseURL).filter(BaseURL.provider_id == provider_id).all()
    return [{"id": u.id, "url": u.url, "priority": u.priority, "is_enabled": u.is_enabled, "timeout": u.timeout} for u in urls]


@router.post("/{provider_id}/base-urls")
def add_base_url(provider_id: str, url: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    u = BaseURL(id=generate_uuid(), provider_id=provider_id, url=url)
    db.add(u)
    db.commit()
    return {"id": u.id, "url": u.url}


@router.get("/modes")
def list_modes(db: Session = Depends(get_db)):
    modes = db.query(AIMode).filter(AIMode.is_enabled == True).order_by(AIMode.sort_order).all()
    return [{"id": m.id, "name": m.name, "slug": m.slug, "description": m.description, "icon": m.icon, "temperature": m.temperature, "streaming": m.streaming} for m in modes]


@router.post("/modes")
def create_mode(name: str, slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    m = AIMode(id=generate_uuid(), name=name, slug=slug)
    db.add(m)
    db.commit()
    return {"id": m.id, "name": m.name}


@router.get("/user")
def list_user_providers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    providers = db.query(UserProvider).filter(UserProvider.user_id == current_user.id).all()
    return [{"id": p.id, "provider_name": p.provider_name, "base_url": p.base_url, "is_enabled": p.is_enabled} for p in providers]


@router.post("/user")
def add_user_provider(provider_name: str, base_url: Optional[str] = None, encrypted_key: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = UserProvider(id=generate_uuid(), user_id=current_user.id, provider_name=provider_name, base_url=base_url, encrypted_key=encrypted_key)
    db.add(p)
    db.commit()
    return {"id": p.id, "provider_name": p.provider_name}


@router.post("/{provider_id}/discover-models")
async def discover_models(provider_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    base_url = db.query(BaseURL).filter(BaseURL.provider_id == provider_id, BaseURL.is_enabled == True).first()
    api_key = db.query(APIKeyVault).filter(APIKeyVault.provider_id == provider_id, APIKeyVault.is_active == True).first()

    if not base_url or not api_key:
        raise HTTPException(status_code=400, detail="Base URL or API key not configured")

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{base_url.url.rstrip('/')}/models",
                headers={"Authorization": f"Bearer {api_key.encrypted_key}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                models_data = data.get("data", data.get("models", []))
                discovered = []
                for model_data in models_data:
                    model_id = model_data.get("id", model_data.get("name", ""))
                    if model_id:
                        existing = db.query(AIModel).filter(AIModel.provider_id == provider_id, AIModel.name == model_id).first()
                        if not existing:
                            m = AIModel(id=generate_uuid(), provider_id=provider_id, name=model_id)
                            db.add(m)
                            discovered.append(model_id)
                db.commit()
                return {"discovered": discovered, "count": len(discovered)}
    except Exception as e:
        pass

    return {"discovered": [], "count": 0, "message": "Could not discover models from this endpoint"}
