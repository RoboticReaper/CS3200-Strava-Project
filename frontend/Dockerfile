# Use official Node.js image
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Expose development port
EXPOSE 3000

# Start the Next.js app in dev mode
CMD ["npm", "run", "dev"]
