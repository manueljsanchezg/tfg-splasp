FROM python:3.14-alpine3.22

RUN apk add --no-cache curl

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

COPY . .

RUN uv sync --no-dev

EXPOSE 8000

CMD ["sh", "-c", "uv run alembic upgrade head && uv run seed.py && uv run fastapi run --port  8000"]
