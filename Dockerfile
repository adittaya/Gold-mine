FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies for the root server
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React frontend
WORKDIR /app/react-client
COPY react-client/package*.json ./
RUN npm install
RUN npm run build

# Go back to root directory
WORKDIR /app

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]