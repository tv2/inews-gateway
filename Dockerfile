# Build phase
FROM node:22-alpine AS BUILD_PHASE
WORKDIR /opt/inews-gateway
COPY . .
RUN yarn install --check-cache --immutable
RUN yarn build
RUN yarn workspaces focus --production

# Configuration phase
FROM node:22-alpine
WORKDIR /opt/inews-gateway
COPY --from=BUILD_PHASE /opt/inews-gateway/dist/ ./
COPY --from=BUILD_PHASE /opt/inews-gateway/node_modules/ ./node_modules/

CMD node .
