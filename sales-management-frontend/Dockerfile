# Dockerfile for React Frontend

# Use the official Node.js image from the Docker Hub
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app/

# Build the application
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", "build"]