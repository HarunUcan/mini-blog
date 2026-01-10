FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/miniblog?schema=public
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

RUN mkdir -p uploads

CMD ["npm", "run", "start:prod"]
