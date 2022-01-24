FROM node:latest


WORKDIR /app
COPY ./ /app/

RUN yarn config set unsafe-perm true
RUN yarn install --force

USER node
CMD cd /app && make start