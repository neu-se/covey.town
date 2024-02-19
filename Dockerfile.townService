FROM node:16-buster-slim
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ /usr/src/app
WORKDIR /usr/src/app/townService
RUN npm --unsafe-perm install && npm run prestart && npm cache clean --force
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "npx", "ts-node", "src/Server.ts" ]