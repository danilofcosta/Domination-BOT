# Definir a imagem base a partir da qual a nova imagem será construída
FROM python:3.13.9

# Definir o diretório de trabalho
WORKDIR /app


# Copiar os arquivos de trabalho para o container
COPY . /app

# Instalar as dependências do projeto
RUN pip install -r requirements.txt

# Executar app
CMD ["python", "main.py"]
