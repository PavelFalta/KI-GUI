FROM node:20-alpine
WORKDIR /usr/src/mobile
COPY src/package.json src/package-lock.json .
RUN npm install
CMD npx expo start
