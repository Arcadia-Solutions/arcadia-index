FROM rust:1.86-slim-bookworm AS prebuild
# Don't delete any downloaded packages, we'd be using BuildKit cache mounts later!
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

WORKDIR /app
# COPY . .
COPY .sqlx/ ./sqlx/

COPY Cargo.toml Cargo.lock ./

# This doesn't mount anything from your system, it's all in the build cache
# Helps speed up repetitive docker builds by A LOT
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y libssl-dev openssl curl pkg-config

# The dummy file is our only way to build only the dependencies before the app itself.
RUN mkdir ./src && \
    echo "fn main() {}" > ./src/dummy.rs

FROM prebuild AS build-prod

RUN mv ./src/dummy.rs ./src/main.rs

RUN SQLX_OFFLINE=true cargo build --release

RUN rm ./src/main.rs
COPY . .

RUN SQLX_OFFLINE=true cargo build --release

FROM prebuild AS build-debug

RUN mv ./src/dummy.rs ./src/main.rs

RUN SQLX_OFFLINE=true cargo build

RUN rm ./src/main.rs
COPY . .

RUN SQLX_OFFLINE=true cargo build

# use --target debug when you want to build the debug variant
FROM debian:bookworm-slim AS debug
WORKDIR /app

COPY --chmod=777 --from=build-debug /app/target/debug/arcadia-index .
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
      apt-get install -y openssl 
CMD ["./arcadia-index"]

FROM debian:bookworm-slim
WORKDIR /app

COPY --chmod=777 --from=build-prod /app/target/release/arcadia-index .

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
      apt-get install -y openssl 

# ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["./arcadia-index"]
