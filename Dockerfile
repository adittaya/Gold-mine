FROM node:18-alpine

WORKDIR /app

# Copy package.json and install root dependencies first
COPY package*.json ./
RUN npm install

# Copy react-client directory and build the frontend
COPY react-client ./react-client
WORKDIR /app/react-client
RUN npm install
RUN npm run build

# Go back to root directory
WORKDIR /app

# Copy the rest of the application code (excluding node_modules)
COPY . .
COPY react-client/dist ./react-client/dist

# Expose the port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]