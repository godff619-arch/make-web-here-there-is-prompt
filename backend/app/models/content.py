from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Chat")
    provider_id = Column(String, nullable=True)
    model_id = Column(String, nullable=True)
    mode_id = Column(String, nullable=True)
    workspace_id = Column(String, nullable=True)
    is_archived = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    folder = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, default="")
    parent_id = Column(String, nullable=True)
    attachments = Column(JSON, default=list)
    tokens_prompt = Column(Integer, default=0)
    tokens_completion = Column(Integer, default=0)
    cost = Column(Float, default=0)
    latency_ms = Column(Integer, default=0)
    model_used = Column(String, nullable=True)
    provider_used = Column(String, nullable=True)
    meta_data = Column(JSON, default=dict)
    is_error = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    folder = Column(String, nullable=True)
    workspace_id = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    meta_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    icon = Column(String, nullable=True)
    branding = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    key = Column(String, unique=True, nullable=False)
    value = Column(JSON, nullable=True)
    group = Column(String, default="general")
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Branding(Base):
    __tablename__ = "branding"

    id = Column(String, primary_key=True, default=generate_uuid)
    site_name = Column(String, default="Universal AI Studio")
    short_name = Column(String, default="AI Studio")
    logo_url = Column(String, nullable=True)
    logo_dark_url = Column(String, nullable=True)
    logo_light_url = Column(String, nullable=True)
    favicon_url = Column(String, nullable=True)
    login_background = Column(String, nullable=True)
    dashboard_background = Column(String, nullable=True)
    primary_color = Column(String, default="#6366f1")
    secondary_color = Column(String, default="#8b5cf6")
    accent_color = Column(String, default="#6366f1")
    font_family = Column(String, default="Inter")
    footer_text = Column(String, nullable=True)
    copyright = Column(String, nullable=True)
    meta_title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    custom_css = Column(Text, nullable=True)
    custom_js = Column(Text, nullable=True)
    is_white_label = Column(Boolean, default=False)
    custom_domain = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True)
    status = Column(String, default="enabled")
    membership_required = Column(String, nullable=True)
    role_required = Column(String, nullable=True)
    workspace_required = Column(String, nullable=True)
    country_restriction = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HomepageSection(Base):
    __tablename__ = "homepage_sections"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    type = Column(String, default="hero")
    title = Column(String, nullable=True)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    content = Column(JSON, default=dict)
    buttons = Column(JSON, default=list)
    images = Column(JSON, default=list)
    background = Column(String, nullable=True)
    animation = Column(String, nullable=True)
    is_enabled = Column(Boolean, default=True)
    is_visible = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    membership_required = Column(String, nullable=True)
    status = Column(String, default="published")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    type = Column(String, default="banner")
    is_active = Column(Boolean, default=True)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    membership_filter = Column(String, nullable=True)
    role_filter = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    variables = Column(JSON, default=list)
    category = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    is_favorite = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    collection_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    folder = Column(String, nullable=True)
    workspace_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    knowledge_base_id = Column(String, ForeignKey("knowledge_bases.id"), nullable=False)
    name = Column(String, nullable=False)
    source_type = Column(String, default="file")
    source_url = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    content_text = Column(Text, nullable=True)
    meta_data = Column(JSON, default=dict)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
