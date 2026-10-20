FROM python:3.11-slim-bookworm

ARG TERADATASQL_VERSION=20.0.0.72

RUN python -m pip install --no-cache-dir "teradatasql==${TERADATASQL_VERSION}"

WORKDIR /app
COPY healthcheck.py /app/healthcheck.py

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app

USER appuser

CMD ["python", "/app/healthcheck.py"]

