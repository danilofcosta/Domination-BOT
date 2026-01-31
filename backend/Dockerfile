FROM python:3.11

WORKDIR /app

COPY ./backend /app

RUN pip install --no-cache-dir fastapi uvicorn

EXPOSE 3000

CMD ["uvicorn", "main_back:app", "--host", "0.0.0.0", "--port", "3000", "--reload"]
