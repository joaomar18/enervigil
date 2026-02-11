FROM python:3.11-alpine

WORKDIR /app

# Install certificate
RUN pip install cryptography
COPY generate_cert.py .
CMD ["python", "generate_cert.py"]