FROM node:16-alpine

ENV NODE_APP_DIR=/var/www/api/src
WORKDIR /var/www/api

# COPY . .

# RUN npm i -g npm
# RUN npm run build

# FROM node:16-alpine

# RUN mkdir -p /var/www/api/dist

# WORKDIR /var/www/api

# COPY .env ./
# COPY .env.example ./
# COPY ./package* ./
# COPY ./index.js ./
# COPY ./server.js ./
COPY . . 
RUN yarn install --force

# COPY --from=builder /var/www/api/node_modules ./node_modules
# COPY --from=builder /var/www/api/src .

EXPOSE 4000

CMD ["yarn", "start-dev"]
