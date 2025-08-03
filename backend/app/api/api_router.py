from fastapi import APIRouter
from app.api.endpoints import (
    users,
    cv,
    departments,
    job_positions,
    candidates,
    applications,
    reviews,
    tests,
    interviews,
    offers,
    login,
    roles,
    stats,
    activities,
    statuses,
)

api_router = APIRouter()

# Thêm router mới vào
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(
    departments.router, prefix="/departments", tags=["departments"]
)
api_router.include_router(
    job_positions.router, prefix="/job_positions", tags=["job_positions"]
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cv.router, prefix="/cvs", tags=["cvs"])

api_router.include_router(
    applications.router, prefix="/applications", tags=["applications"]
)

api_router.include_router(
    reviews.router, prefix="/technical-reviews", tags=["technical_reviews"]
)
api_router.include_router(
    tests.router, prefix="/technical-tests", tags=["technical_tests"]
)
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
api_router.include_router(statuses.router, prefix="/statuses", tags=["statuses"])
