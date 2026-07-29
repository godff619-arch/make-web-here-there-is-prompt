import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Float, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from app.core.database import Base
import enum


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    GUEST = "guest"
    MEMBER = "member"
    MODERATOR = "moderator"
    DEVELOPER = "developer"
    ADMIN = "admin"
    OWNER = "owner"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    display_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    role = Column(String, default=UserRole.MEMBER.value)
    avatar_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    language = Column(String, default="en")
    timezone = Column(String, default="UTC")
    theme = Column(String, default="dark")
    accent_color = Column(String, default="#6366f1")
    compact_mode = Column(Boolean, default=False)
    membership_id = Column(String, ForeignKey("memberships.id"), nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    verification_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    google_id = Column(String, nullable=True)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("UserApiKey", back_populates="user", cascade="all, delete-orphan")
    providers = relationship("UserProvider", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    device_info = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    price_monthly = Column(Float, default=0)
    price_yearly = Column(Float, default=0)
    price_lifetime = Column(Float, default=0)
    trial_days = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    features = Column(JSON, default=dict)
    limits = Column(JSON, default=dict)
    color = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=list)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    logo_dark_url = Column(String, nullable=True)
    logo_light_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    documentation_url = Column(String, nullable=True)
    support_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    color = Column(String, nullable=True)
    api_type = Column(String, default="openai_compatible")
    is_enabled = Column(Boolean, default=True)
    is_global = Column(Boolean, default=True)
    is_maintenance = Column(Boolean, default=False)
    priority = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    membership_required = Column(String, nullable=True)
    role_required = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    base_urls = relationship("BaseURL", back_populates="provider", cascade="all, delete-orphan")
    models = relationship("AIModel", back_populates="provider", cascade="all, delete-orphan")


class BaseURL(Base):
    __tablename__ = "base_urls"

    id = Column(String, primary_key=True, default=generate_uuid)
    provider_id = Column(String, ForeignKey("ai_providers.id"), nullable=False)
    url = Column(String, nullable=False)
    is_enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    timeout = Column(Integer, default=60)
    retry_count = Column(Integer, default=3)
    rate_limit = Column(Integer, default=0)
    auth_type = Column(String, default="bearer")
    custom_headers = Column(JSON, default=dict)
    proxy = Column(String, nullable=True)
    ssl_verify = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    provider = relationship("AIProvider", back_populates="base_urls")


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String, primary_key=True, default=generate_uuid)
    provider_id = Column(String, ForeignKey("ai_providers.id"), nullable=False)
    name = Column(String, nullable=False)
    alias = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    context_window = Column(Integer, default=4096)
    max_tokens = Column(Integer, default=4096)
    supports_streaming = Column(Boolean, default=True)
    supports_vision = Column(Boolean, default=False)
    supports_function_calling = Column(Boolean, default=False)
    supports_json_mode = Column(Boolean, default=False)
    supports_reasoning = Column(Boolean, default=False)
    supports_image_generation = Column(Boolean, default=False)
    supports_audio = Column(Boolean, default=False)
    supports_video = Column(Boolean, default=False)
    supports_code = Column(Boolean, default=False)
    supports_search = Column(Boolean, default=False)
    category = Column(String, default="general")
    tags = Column(JSON, default=list)
    release_version = Column(String, nullable=True)
    pricing_prompt_per_1k = Column(Float, default=0)
    pricing_completion_per_1k = Column(Float, default=0)
    is_enabled = Column(Boolean, default=True)
    is_global = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    membership_required = Column(String, nullable=True)
    role_required = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    provider = relationship("AIProvider", back_populates="models")


class APIKeyVault(Base):
    __tablename__ = "api_key_vault"

    id = Column(String, primary_key=True, default=generate_uuid)
    provider_id = Column(String, ForeignKey("ai_providers.id"), nullable=False)
    key_name = Column(String, nullable=False)
    encrypted_key = Column(Text, nullable=False)
    scope = Column(String, default="global")
    workspace_id = Column(String, nullable=True)
    membership_id = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    rotation_days = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    health_status = Column(String, default="unknown")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserApiKey(Base):
    __tablename__ = "user_api_keys"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    token_hash = Column(String, nullable=False)
    prefix = Column(String, nullable=False)
    scopes = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="api_keys")


class UserProvider(Base):
    __tablename__ = "user_providers"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider_name = Column(String, nullable=False)
    base_url = Column(String, nullable=True)
    encrypted_key = Column(Text, nullable=True)
    models_data = Column(JSON, default=list)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="providers")


class AIMode(Base):
    __tablename__ = "ai_modes"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    preferred_provider_id = Column(String, nullable=True)
    preferred_model_id = Column(String, nullable=True)
    temperature = Column(Float, default=0.7)
    top_p = Column(Float, default=1.0)
    max_tokens = Column(Integer, default=4096)
    streaming = Column(Boolean, default=True)
    reasoning_level = Column(String, default="medium")
    is_enabled = Column(Boolean, default=True)
    is_global = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
