# Development image for the Express API, built by compose.yaml.
# Build it through Docker Compose (`npm run dev`), not plain `docker build`,
# because it needs the extra "database" build context defined there.
FROM node:22-alpine

# Run as the unprivileged "node" user that ships with the image, not root.
RUN mkdir -p /app /database/migrations && chown -R node:node /app /database
WORKDIR /app
USER node

# Install dependencies before copying source so this slow step is cached
# until package.json or package-lock.json changes.
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .
COPY --chown=node:node --from=database migrations /database/migrations

EXPOSE 3000

CMD ["npm", "run", "dev"]
