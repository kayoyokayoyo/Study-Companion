import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import engine, Base
from routers import auth, courses, eval_types, quizzes, questions, stats, suggestions
from seed import seed_default_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_default_data()
    yield


app = FastAPI(title="QuizNET API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


app.include_router(auth.router, prefix="/api/auth")
app.include_router(courses.router, prefix="/api/courses")
app.include_router(eval_types.router, prefix="/api/eval-types")
app.include_router(quizzes.router, prefix="/api/quizzes")
app.include_router(questions.router, prefix="/api/questions")
app.include_router(stats.router, prefix="/api/stats")
app.include_router(suggestions.router, prefix="/api/suggestions")


@app.get("/api/healthz")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
