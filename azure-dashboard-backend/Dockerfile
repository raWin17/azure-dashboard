# Use the latest LTS version of Node.js
FROM node:22-alpine

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
# This is a crucial step that ensures dependencies are handled correctly.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application's source code to the container.
COPY . .

# Expose the port your application listens on.
EXPOSE 3000

# Define the command to run your application.
CMD ["node", "index.js"]