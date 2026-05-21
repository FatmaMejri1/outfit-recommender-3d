FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (required for some packages if they compile from source)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set pythonpath so FastAPI can find the app module
ENV PYTHONPATH=/app

EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
