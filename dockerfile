# Imagem base
FROM python:3.13.9

# Diretório de trabalho
WORKDIR /app

# Copiar apenas requirements primeiro (melhora cache)
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar restante dos arquivos
COPY . .

# Comando para rodar o app
CMD ["python", "main.py"]
