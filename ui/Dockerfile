FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the SvelteKit app
RUN npm run build

EXPOSE 8080

CMD ["node", "build"]