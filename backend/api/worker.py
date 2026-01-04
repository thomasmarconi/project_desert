from celery import Celery
from backend.api.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.task_routes = {
    "backend.api.worker.test_celery": "main-queue"
}

@celery_app.task(acks_late=True)
def test_celery(word: str) -> str:
    return f"test task return {word}"
