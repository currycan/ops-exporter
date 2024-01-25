FROM golang:1.21-alpine as builder

WORKDIR $GOPATH/src/github.com/currycan/ops-exporter

ENV GOPROXY=https://goproxy.cn

RUN set -ex; apk add --no-cache upx ca-certificates tzdata;
COPY ./go.mod ./
COPY ./go.sum ./
RUN set -ex; go mod download
COPY . .
RUN set -ex; \
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o flusher; \
  upx --best ops-exporter -o _upx_flusher; \
  mv -f _upx_flusher ops-exporter

FROM scratch

LABEL maintainer="currycan <ansandy@foxmail.com>"

COPY --from=builder /go/src/github.com/currycan/ops-exporter/ops-exporter /usr/bin/ops-exporter

EXPOSE 9091

CMD ["ops-exporter"]