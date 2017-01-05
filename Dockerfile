FROM kkarczmarczyk/node-yarn:7.2
MAINTAINER Victor J. Fernandez <victor.j.fdez@gmail.com>

EXPOSE 8084
EXPOSE 8085

WORKDIR /usr/src/app

COPY lib/ lib/
COPY  yarn.lock \
     package.json \
     .babelrc \
     LICENSE \
     ./

RUN yarn install && \
     mkdir logs/
ENTRYPOINT ["npm"]
CMD ["run", "prod:server"]
