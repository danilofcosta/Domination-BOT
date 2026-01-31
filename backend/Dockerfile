FROM python:3.11

WORKDIR /app

# Copia primeiro o requirements para aproveitar cache
COPY ../requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Agora copia o código do backend para dentro da imagem
COPY . .

EXPOSE 3000

CMD ["uvicorn", "main_back:app", "--host", "0.0.0.0", "--port", "3000"]
