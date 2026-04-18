FROM python:3.11-alpine

WORKDIR /app

# Install certificate
RUN pip install cryptography
COPY generation .
CMD ["python", "entrypoint.py"]