FROM jrottenberg/ffmpeg:5.0-alpine as ffmpeg

FROM node:16-alpine

ENV NODE_APP_DIR=/var/www/api/src
WORKDIR /var/www/api

COPY . . 
RUN yarn install --force

# copy ffmpeg bins
COPY --from=ffmpeg / /

CMD ["node", "src/jobs/queue-worker.js", "run"]
