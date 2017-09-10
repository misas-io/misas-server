FROM kkarczmarczyk/node-yarn:7.2
MAINTAINER Victor J. Fernandez <victor.j.fdez@gmail.com>

EXPOSE 8084
EXPOSE 8085

WORKDIR /usr/src/app

COPY  yarn.lock \
     package.json \
     .babelrc \
     LICENSE \
     ./

RUN yarn install && \
     mkdir logs/

COPY lib/ lib/

VOLUME ["/usr/src/app/", "/etc/misas/"]
ENTRYPOINT ["npm"]
CMD ["run", "prod:server"]
