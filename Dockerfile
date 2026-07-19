FROM node:24-slim

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# npm ci installs exactly what's in package-lock.json, for a reproducible build.
RUN npm ci

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
