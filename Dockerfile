FROM ghcr.io/puppeteer/puppeteer:22.6.3 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=3000 \
    SESSION_SECRET=ABCDEF \
    POSTGRESQL_URL=postgresql://nmcnpmprojectdb:wnNURCXo8PeQx30Z1GqOkBVahnIKSaNH@dpg-cq190jeehbks73eumpbg-a.singapore-postgres.render.com/nmcnpmprojectdb_8e5d \
    MJ_APIKEY_PUBLIC=fa441d0d385f13c17967a92c900ca3b5 \
    MJ_APIKEY_PRIVATE=c10f766c00c2b8f38b8858e58b3b5d84

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "index.js" ]

