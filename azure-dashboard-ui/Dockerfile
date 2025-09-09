# Use the latest LTS version of Node.js
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# # Expose the port your app runs on
# EXPOSE 3001

# # Define the command to run your app
# CMD ["npm", "start"]

# new things
RUN npm run build

# Stage 2: Serve the production build with NGINX
FROM nginx:alpine

# Copy the custom Nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from the 'build' stage to NGINX's web root
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for NGINX
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]