FROM rust:1.86-slim-bullseye
WORKDIR /app
COPY . .

RUN if [ ! -f ".env" ]; then \
    echo "No custom .env file found, using default env"; \
    cp .env.example .env; \
fi

RUN apt-get update && apt-get install -y postgresql postgresql-client libssl-dev openssl curl
RUN mkdir -p /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql/data
USER postgres

RUN find /usr/lib/postgresql/*/bin/initdb -executable -type f -print -quit | xargs -I {} sh -c "{} -D /var/lib/postgresql/data --no-locale --encoding=UTF8"
RUN cat migrations/fixtures/create_db.sql migrations/20250312215600_initdb.sql migrations/fixtures/fixtures.sql > /var/lib/postgresql/data/init.sql
# the db needs to be running at build time for sqlx compile-time checks
RUN nohup sh -c "psql -U arcadia -d arcadia -f /init.sql &" && sleep 4

USER root
RUN cargo build --release

# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/app/target/release/arcadia"]
