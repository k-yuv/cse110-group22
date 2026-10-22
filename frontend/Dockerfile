# Development image for the Vite dev server, built by compose.yaml.
FROM node:22-alpine

# Run as the unprivileged "node" user that ships with the image, not root.
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Install dependencies before copying source so this slow step is cached
# until package.json or package-lock.json changes.
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .

EXPOSE 5173

# The `dev` script already passes --host 0.0.0.0 so the server is reachable
# from outside the container.
CMD ["npm", "run", "dev"]
