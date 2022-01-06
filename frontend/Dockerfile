FROM node:16-buster-slim
RUN apt-get update || : && apt-get install python build-essential -y && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ /usr/src/app
RUN rm -rf node_modules
RUN npm ci 
WORKDIR /usr/src/app/frontend
RUN rm -rf node_modules 
RUN npm ci
ENV GENERATE_SOURCEMAP false
ENV NODE_OPTIONS --max_old_space_size=2048
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
ARG REACT_APP_TOWNS_SERVICE_URL
ENV REACT_APP_TOWNS_SERVICE_URL=${REACT_APP_TOWNS_SERVICE_URL}
RUN npm run build
RUN npm install -g serve
CMD [ "serve", "-s", "build" ]
