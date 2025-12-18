# --- Backend Dockerfile ---
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Đặt biến môi trường để backend biết đang chạy trong container
ENV PORT=8000
EXPOSE 8000

# Chạy server
CMD ["npm", "start"]
