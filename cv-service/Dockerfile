FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src
COPY models ./models

EXPOSE 8002

CMD ["python", "src/app.py"]