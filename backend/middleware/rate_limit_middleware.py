import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_attempts=5, window_seconds=300, ban_seconds=900):
        super().__init__(app)
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.ban_seconds = ban_seconds
        self.attempts = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/auth/login" and request.method == "POST":
            ip = request.client.host if request.client else "unknown"
            now = time.time()

            self.attempts[ip] = [t for t in self.attempts[ip] if now - t < self.window_seconds]

            if len(self.attempts[ip]) >= self.max_attempts:
                return JSONResponse(
                    status_code=429,
                    content={"success": False, "error": f"Demasiados intentos. Espere {self.ban_seconds // 60} minutos."}
                )

            response = await call_next(request)

            if response.status_code == 401:
                self.attempts[ip].append(now)

            return response

        return await call_next(request)
