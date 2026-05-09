FROM node:20-alpine
WORKDIR /app
COPY apps/app/ ./public/
RUN npm install -g serve
EXPOSE 3001
CMD ["serve", "-l", "3001", "public"]
