# Use an official lightweight Python image
FROM python:3.10-slim

# Set environment variables to prevent Python from writing .pyc files
# and to ensure console output is not buffered by Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Copy only the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# (Optional) If you are using spaCy models, you may need to download them here:
# RUN python -m spacy download en_core_web_sm

# Copy the rest of the application code
COPY . .

# Expose the port that the FastAPI app runs on (as per README)
EXPOSE 8002

# Command to run the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
