FROM kkarczmarczyk/node-yarn:7.2
MAINTAINER Victor J. Fernandez <victor.j.fdez@gmail.com>

EXPOSE 8084
EXPOSE 8085

WORKDIR /usr/src/app

COPY connectors/ connectors/
COPY misc/ misc/ 
COPY migrations/ migrations/
COPY scripts/ scripts/
COPY config/ config/
COPY api/ api/
COPY server.js \
     log.js \
     settings.js \
     yarn.lock \
     package.json \
     .babelrc \
     LICENSE \
     ./

RUN yarn install
ENTRYPOINT ["npm"]
CMD ["run", "server"]
