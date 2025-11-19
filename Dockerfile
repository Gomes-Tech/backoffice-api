FROM node:22-alpine AS build

RUN apk update && apk add curl bash && curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /var/app
ARG YARN_TIMEOUT=60000
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --network-timeout $YARN_TIMEOUT

COPY . .
RUN yarn prisma:generate && yarn build

# Remover devDependencies com yarn
RUN yarn install --frozen-lockfile --production --network-timeout $YARN_TIMEOUT

# Usar node-prune para limpar ainda mais
RUN node-prune

RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} +

FROM node:22-alpine AS runtime
ARG VERSION="1.0.0"
ENV VERSION $VERSION
ENV NODE_ENV production
WORKDIR /home/node/app
RUN apk add dumb-init openssl

# Add Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER node
EXPOSE 4000

COPY --chown=node:node --from=build /var/app/node_modules ./node_modules/
COPY --chown=node:node --from=build /var/app/dist ./dist
COPY --chown=node:node --from=build /var/app/prisma ./prisma
COPY --chown=node:node package.json .docker/entrypoint.sh ./

CMD ["sh", "-c", "yarn db:deploy && dumb-init node dist/src/main.js"]