from typing import Optional
from fastapi import Request


def absolute_url(request: Request, url: Optional[str]) -> Optional[str]:
    """Turn a relative "/static/..." path into an absolute URL.

    Leaves None, data: URLs and already-absolute http(s) URLs untouched, so the
    client always receives something it can load directly.
    """
    if not url:
        return url
    if url.startswith(("http://", "https://", "data:")):
        return url
    base = str(request.base_url).rstrip("/")
    return f"{base}{url}"
