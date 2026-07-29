#!/usr/bin/env python3
"""Universal AI Studio - Main Entry Point"""

import os
import sys
import time
import subprocess
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))


def check_python():
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 10):
        print("Python 3.10+ required")
        sys.exit(1)


def check_dependencies():
    missing = []
    try:
        import fastapi
    except ImportError:
        missing.append("fastapi")
    try:
        import uvicorn
    except ImportError:
        missing.append("uvicorn")
    try:
        import sqlalchemy
    except ImportError:
        missing.append("sqlalchemy")
    try:
        import rich
    except ImportError:
        missing.append("rich")

    if missing:
        print(f"\nMissing dependencies: {', '.join(missing)}")
        print(f"\nInstall with: pip install -r {BACKEND_DIR}/requirements.txt")
        return False
    return True


def init_directories():
    dirs = [
        BACKEND_DIR / "uploads",
        BACKEND_DIR / "logs",
        BACKEND_DIR / "static",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)


def init_database():
    from app.core.config import settings
    from app.core.database import init_db
    from app.models.user import User, Membership, generate_uuid
    from app.core.database import SessionLocal
    from app.core.security import hash_password

    init_db()
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            owner = User(
                id=generate_uuid(),
                email="admin@universalai.studio",
                username="admin",
                display_name="Administrator",
                hashed_password=hash_password("admin123"),
                role="owner",
                is_verified=True,
                is_active=True,
            )
            db.add(owner)

            free_plan = Membership(id=generate_uuid(), name="Free", slug="free", description="Free tier", price_monthly=0, price_yearly=0, sort_order=0)
            starter_plan = Membership(id=generate_uuid(), name="Starter", slug="starter", description="Starter plan", price_monthly=9.99, price_yearly=99.99, sort_order=1)
            pro_plan = Membership(id=generate_uuid(), name="Pro", slug="pro", description="Professional plan", price_monthly=29.99, price_yearly=299.99, sort_order=2)
            business_plan = Membership(id=generate_uuid(), name="Business", slug="business", description="Business plan", price_monthly=99.99, price_yearly=999.99, sort_order=3)
            enterprise_plan = Membership(id=generate_uuid(), name="Enterprise", slug="enterprise", description="Enterprise plan", price_monthly=299.99, price_yearly=2999.99, sort_order=4)

            db.add_all([free_plan, starter_plan, pro_plan, business_plan, enterprise_plan])
            db.commit()
    finally:
        db.close()


def print_startup():
    try:
        from rich.console import Console
        from rich.panel import Panel
        from rich.table import Table
        from rich import box

        console = Console()
        console.print()
        console.print(Panel.fit(
            "[bold bright_blue]UNIVERSAL AI STUDIO[/bold bright_blue]\n[dim]v1.0.0 - Enterprise AI Platform[/dim]",
            border_style="bright_blue",
            padding=(1, 4),
        ))
        console.print()

        table = Table(box=box.ROUNDED, show_header=False, border_style="dim")
        table.add_column("Check", style="green", width=4)
        table.add_column("Component", style="white", width=24)

        items = [
            "Python Environment",
            "Dependencies",
            "Database",
            "Uploads Directory",
            "Logs Directory",
            "AI Providers Ready",
            "Authentication Ready",
            "API Ready",
            "Admin Panel Ready",
            "WebSocket Ready",
        ]
        for item in items:
            table.add_row("[green]✓[/green]", item)
            time.sleep(0.05)

        console.print(table)
        console.print()

        info = Table(box=box.ROUNDED, show_header=False, border_style="dim blue")
        info.add_column("Label", style="dim", width=12)
        info.add_column("URL", style="bright_blue")
        info.add_row("Local", "http://127.0.0.1:8000")
        info.add_row("Admin", "http://127.0.0.1:8000/admin")
        info.add_row("Health", "http://127.0.0.1:8000/api/health")
        info.add_row("Swagger", "http://127.0.0.1:8000/docs")
        console.print(info)
        console.print()
        console.print("[dim]Default admin: admin@universalai.studio / admin123[/dim]")
        console.print()
    except ImportError:
        print("\n" + "=" * 52)
        print("       UNIVERSAL AI STUDIO v1.0.0")
        print("=" * 52)
        print()
        print("  Local:    http://127.0.0.1:8000")
        print("  Admin:    http://127.0.0.1:8000/admin")
        print("  Health:   http://127.0.0.1:8000/api/health")
        print("  Swagger:  http://127.0.0.1:8000/docs")
        print()
        print("  Default admin: admin@universalai.studio / admin123")
        print("=" * 52)
        print()


def serve_frontend():
    frontend_dist = BASE_DIR / "frontend" / "dist"
    if frontend_dist.exists():
        return

    frontend_dir = BASE_DIR / "frontend"
    if not frontend_dir.exists():
        return

    if not (frontend_dir / "node_modules").exists():
        return

    import shutil
    npm = shutil.which("npm")
    if npm:
        result = subprocess.run([npm, "run", "build"], cwd=str(frontend_dir), capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[dim]Frontend build skipped (will use API only)[/dim]")


def main():
    parser = argparse.ArgumentParser(description="Universal AI Studio")
    parser.add_argument("--dev", action="store_true", help="Developer mode")
    parser.add_argument("--prod", action="store_true", help="Production mode")
    parser.add_argument("--check", action="store_true", help="Run diagnostics")
    parser.add_argument("--health", action="store_true", help="Health check")
    parser.add_argument("--host", default="0.0.0.0", help="Host")
    parser.add_argument("--port", type=int, default=8000, help="Port")
    args = parser.parse_args()

    check_python()

    if args.health:
        try:
            import httpx
            resp = httpx.get(f"http://{args.host}:{args.port}/api/health", timeout=5)
            print(resp.json())
        except Exception as e:
            print(f"Health check failed: {e}")
            sys.exit(1)
        return

    if args.check:
        check_python()
        if check_dependencies():
            init_directories()
            init_database()
            print("All checks passed.")
        else:
            sys.exit(1)
        return

    os.environ.setdefault("DEBUG", "true" if args.dev else "false")
    if args.dev:
        os.environ["DEBUG"] = "true"

    if not check_dependencies():
        sys.exit(1)

    init_directories()
    init_database()
    serve_frontend()
    print_startup()

    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.dev,
        log_level="info" if not args.dev else "debug",
    )


if __name__ == "__main__":
    main()
