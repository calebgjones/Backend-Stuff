FROM node:18-alpine as base
WORKDIR /usr/app/

## ENVIRONMENT VARIABLES
# Server Config
ENV PORT=8443
ENV LOG_LEVEL=debug
ENV APP_NAME="music-player-backend"
# Postgres Connection Info
ENV PG_DATABASE=""
ENV PG_USERNAME=""
ENV PG_PASSWORD=""
ENV PG_HOST=""
ENV PG_PORT=""

#S3 Connection Info
ENV AWS_S3_BUCKET=""
ENV AWS_REGION=""
ENV AWS_ACCESS_KEY_ID=""
ENV AWS_SECRET_ACCESS_KEY=""


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install



## NODE MODULES
# Install Dev Node Modules
RUN mkdir -p /var/dev
COPY package.json package-lock.json /var/dev/
RUN cd /var/dev && npm install --development
# Install Prod Node Modules
RUN mkdir -p /var/prod
COPY package.json package-lock.json /var/prod/
RUN cd /var/prod && npm install --production



##
## Development Build
## - copy dev dependencies and source code into final image
##
FROM base AS dev
COPY --from=install /var/dev/node_modules node_modules
COPY ./ /usr/app/

# run the app
EXPOSE 8443/tcp
CMD npm run dev



##
## Production Build
## - copy production dependencies and source code into final image
##
FROM base AS prod

COPY --from=install /var/prod/node_modules node_modules
COPY --from=dev /usr/app/src/ ./src/
COPY --from=dev /usr/app/package.json package.json

# run the app
EXPOSE 8443/tcp
CMD npm run start
