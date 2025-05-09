# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Expose the port your app listens on (change if needed)
EXPOSE 2139

# Default command to run your app
CMD ["npm", "start"]
