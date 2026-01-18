FROM python:3.13.9

WORKDIR /app

COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar restante dos arquivos
COPY . .

# Comando para rodar o app
CMD ["python", "run.py"]