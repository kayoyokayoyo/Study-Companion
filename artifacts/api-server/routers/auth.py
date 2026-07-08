from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from auth_utils import ADMIN_PASSWORD, COOKIE_NAME, generate_token, is_admin

router = APIRouter()


class LoginInput(BaseModel):
    password: str


@router.post("/login")
def login(data: LoginInput, response: Response):
    if data.password != ADMIN_PASSWORD:
        return JSONResponse(status_code=401, content={"error": "Invalid credentials"})
    token = generate_token()
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
        path="/",
    )
    return {"isAdmin": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"success": True}


@router.get("/me")
def get_me(request: Request):
    return {"isAdmin": is_admin(request)}
