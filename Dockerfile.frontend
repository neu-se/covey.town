FROM node:18-buster-slim
RUN apt-get update || : && apt-get install python3 build-essential libpango1.0-dev libcairo2-dev libjpeg-dev libgif-dev -y && rm -rf /var/lib/apt/lists/*
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
ARG NEXT_PUBLIC_TOWNS_SERVICE_URL
ENV NEXT_PUBLIC_TOWNS_SERVICE_URL=${NEXT_PUBLIC_TOWNS_SERVICE_URL}
RUN npm run build
CMD [ "npm", "start" ]
