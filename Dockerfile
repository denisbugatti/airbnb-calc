# Build: gera os estáticos (dist/public) e o bundle do servidor (dist/index.js)
FROM node:22-alpine AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runtime: o próprio servidor Node — além dos estáticos, expõe /api/img-proxy e
# /api/fotos-pagina, que o gerador de PDF usa para buscar fotos externas
# (o nginx estático anterior não tinha esses endpoints e a busca quebrava).
# O bundle do servidor é ESM com dependências externas; a única de runtime é o
# express, instalado aqui direto para manter a imagem pequena.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=80
RUN printf '{"type":"module"}' > package.json && npm install --no-audit --no-fund express@4.21.2
COPY --from=build /app/dist ./dist
EXPOSE 80
CMD ["node", "dist/index.js"]
