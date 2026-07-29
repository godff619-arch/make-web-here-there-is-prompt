from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User, generate_uuid
from app.models.content import Conversation, Message
from app.api.deps import get_current_user
import httpx
import json

router = APIRouter(prefix="/api/chat", tags=["chat"])


class SendMessageRequest(BaseModel):
    content: str
    model_id: Optional[str] = None
    provider_id: Optional[str] = None
    mode_id: Optional[str] = None
    attachments: List[dict] = []
    stream: bool = True


class CreateConversationRequest(BaseModel):
    title: Optional[str] = None


@router.get("/conversations")
def list_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    folder: Optional[str] = None,
    is_archived: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    if search:
        q = q.filter(Conversation.title.ilike(f"%{search}%"))
    if folder is not None:
        q = q.filter(Conversation.folder == folder)
    if is_archived is not None:
        q = q.filter(Conversation.is_archived == is_archived)
    if is_pinned is not None:
        q = q.filter(Conversation.is_pinned == is_pinned)

    total = q.count()
    conversations = q.order_by(desc(Conversation.updated_at)).offset((page - 1) * limit).limit(limit).all()
    return {
        "conversations": [{
            "id": c.id, "title": c.title, "provider_id": c.provider_id,
            "model_id": c.model_id, "mode_id": c.mode_id,
            "is_archived": c.is_archived, "is_pinned": c.is_pinned,
            "is_favorite": c.is_favorite, "folder": c.folder, "tags": c.tags,
            "created_at": c.created_at.isoformat(), "updated_at": c.updated_at.isoformat(),
        } for c in conversations],
        "total": total, "page": page,
    }


@router.post("/conversations")
def create_conversation(
    req: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = Conversation(
        id=generate_uuid(),
        user_id=current_user.id,
        title=req.title or "New Chat",
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "title": c.title, "created_at": c.created_at.isoformat()}


@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    return {
        "id": c.id, "title": c.title, "provider_id": c.provider_id, "model_id": c.model_id,
        "mode_id": c.mode_id, "is_pinned": c.is_pinned, "is_favorite": c.is_favorite,
        "folder": c.folder, "tags": c.tags,
        "messages": [{
            "id": m.id, "role": m.role, "content": m.content,
            "attachments": m.attachments, "is_error": m.is_error, "is_edited": m.is_edited,
            "model_used": m.model_used, "provider_used": m.provider_used,
            "tokens_prompt": m.tokens_prompt, "tokens_completion": m.tokens_completion,
            "cost": m.cost, "latency_ms": m.latency_ms,
            "created_at": m.created_at.isoformat(),
        } for m in messages],
    }


@router.put("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: str,
    title: Optional[str] = None,
    is_archived: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    is_favorite: Optional[bool] = None,
    folder: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404)
    if title is not None:
        c.title = title
    if is_archived is not None:
        c.is_archived = is_archived
    if is_pinned is not None:
        c.is_pinned = is_pinned
    if is_favorite is not None:
        c.is_favorite = is_favorite
    if folder is not None:
        c.folder = folder
    c.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Updated"}


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404)
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    req: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_msg = Message(
        id=generate_uuid(),
        conversation_id=conversation_id,
        role="user",
        content=req.content,
        attachments=req.attachments,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)

    assistant_msg = Message(
        id=generate_uuid(),
        conversation_id=conversation_id,
        role="assistant",
        content="",
        model_used=req.model_id or c.model_id,
        provider_used=req.provider_id or c.provider_id,
        created_at=datetime.utcnow(),
    )
    db.add(assistant_msg)

    c.title = req.content[:100] if len(c.title) <= 8 or c.title == "New Chat" else c.title
    c.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)

    if req.stream:
        async def generate():
            response_text = f"Hello! I am Universal AI Studio's assistant. You said: {req.content}\n\n"
            response_text += "I'm here to help with chat, coding, image generation, document editing, research, and more. What would you like to work on?"
            assistant_msg.content = response_text
            db.commit()
            yield f"data: {json.dumps({'type': 'content', 'content': response_text})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    response_text = f"Hello! I am Universal AI Studio's assistant. You said: {req.content}\n\nI'm here to help with chat, coding, image generation, document editing, research, and more."
    assistant_msg.content = response_text
    db.commit()

    return {
        "user_message": {"id": user_msg.id, "role": "user", "content": req.content},
        "assistant_message": {"id": assistant_msg.id, "role": "assistant", "content": response_text},
    }


@router.put("/messages/{message_id}")
def edit_message(message_id: str, content: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404)
    msg.content = content
    msg.is_edited = True
    db.commit()
    return {"message": "Updated"}


@router.delete("/messages/{message_id}")
def delete_message(message_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404)
    db.delete(msg)
    db.commit()
    return {"message": "Deleted"}
