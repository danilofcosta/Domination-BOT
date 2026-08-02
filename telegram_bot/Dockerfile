FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci \
    && npx prisma generate

COPY . .

RUN mkdir -p /app/data

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
