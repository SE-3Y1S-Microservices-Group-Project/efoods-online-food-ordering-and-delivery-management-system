# Use an official Node.js LTS version image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on (customize if not 3000)
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
