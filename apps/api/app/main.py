from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.routes.agent import router as agent_router
from app.routes.health import router as health_router
from app.routes.planner import router as planner_router
from app.routes.tools import router as tools_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    print("[ROUTES]")
    print("/health")
    print("/api/plan")
    print("/api/agent/plan-pack")
    print("/api/tools")
    print("/api/tools/execute")
    yield


app = FastAPI(title="游素工坊 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(planner_router)
app.include_router(agent_router)
app.include_router(tools_router)
