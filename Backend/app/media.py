import base64
import re
import uuid
from pathlib import Path

from fastapi import HTTPException
from fastapi.responses import FileResponse

from app.config import MEDIA_DIR

_DATA_URL = re.compile(r"^data:(image/[\w.+-]+);base64,(.+)$", re.DOTALL)


def public_url(filename: str | None) -> str | None:
    if not filename:
        return None
    return f"/api/media/{filename}"


def save_image(value: str | None, prefix: str) -> str | None:
    if not value:
        return None
    if value.startswith("/api/media/"):
        name = value.rsplit("/", 1)[-1]
        if (MEDIA_DIR / name).is_file():
            return name
        return None
    match = _DATA_URL.match(value.strip())
    if not match:
        return None
    mime, payload = match.groups()
    ext = "jpg"
    if "png" in mime:
        ext = "png"
    elif "webp" in mime:
        ext = "webp"
    try:
        raw = base64.b64decode(payload, validate=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Imagem inválida.") from exc
    if not raw:
        raise HTTPException(status_code=400, detail="Imagem inválida.")
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{prefix}-{uuid.uuid4().hex}.{ext}"
    (MEDIA_DIR / name).write_bytes(raw)
    return name


def media_response(filename: str) -> FileResponse:
    safe = Path(filename).name
    path = MEDIA_DIR / safe
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return FileResponse(path)


def delete_image(filename: str | None) -> None:
    if not filename:
        return
    path = MEDIA_DIR / Path(filename).name
    if path.is_file():
        path.unlink()
