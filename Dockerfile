FROM node:18-alpine

WORKDIR /app

# Copy package.json and install root dependencies first
COPY package*.json ./
RUN npm install

# Copy server files first (excluding react-client to avoid overwriting the build)
COPY server.js ./
COPY netlify.toml ./
COPY build.sh ./
COPY postman*.json ./
COPY README.md ./

# Copy and build the react-client directory
COPY react-client ./react-client
WORKDIR /app/react-client
RUN npm install
RUN npm run build

# Go back to root directory and copy remaining root files
WORKDIR /app
COPY . .

# Expose the port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]