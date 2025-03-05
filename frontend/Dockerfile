# Use Node.js Alpine as the base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies (this step is mostly for caching purposes; 
# the host mount will override these files at runtime)
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose Vite’s default development port
EXPOSE 5173

# Default command (this will be overridden by docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]
