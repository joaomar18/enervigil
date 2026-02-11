FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies if needed
RUN apk add --no-cache gcc musl-dev

# Copy project metadata first (for caching)
COPY pyproject.toml ./

# Copy application code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "main.py"]