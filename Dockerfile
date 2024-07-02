FROM ghcr.io/puppeteer/puppeteer:22.6.3 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=3000 \
    SESSION_SECRET=ABCDEF \
    POSTGRESQL_URL=postgresql://nmcnpmprojectdb2:vktzKeBBJdg7QGbsszAXodWNQ09CVt41@dpg-cq1ud7rv2p9s73d8ndt0-a.singapore-postgres.render.com/nmcnpmprojectdb2 \
    MJ_APIKEY_PUBLIC=fa441d0d385f13c17967a92c900ca3b5 \
    MJ_APIKEY_PRIVATE=c10f766c00c2b8f38b8858e58b3b5d84

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "index.js" ]

