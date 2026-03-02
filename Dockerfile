# Lightweight dev environment for A&E Waiting Time app
FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --silent

# Copy rest of source
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
