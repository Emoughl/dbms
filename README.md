# Teradata + Qdrant development stack

Bộ cấu hình này chạy **Qdrant thật** bằng Docker và cung cấp một container
**Teradata client/toolbox** để kết nối tới Teradata Vantage bên ngoài.

> Teradata không phát hành database server dưới dạng Docker image chính thức.
> Vantage Express được Teradata phân phối dưới dạng máy ảo; vì vậy service
> `teradata-client` không phải database server và cần một Vantage endpoint có sẵn.

## Yêu cầu

- Docker Engine hoặc Docker Desktop
- Docker Compose v2
- Với Teradata: Teradata Vantage/Vantage Express đang chạy và có thể truy cập từ Docker

## 1. Cấu hình

```bash
cp .env.example .env
```

Đổi `QDRANT_API_KEY` trong `.env`. Nếu dùng Teradata, điền thêm
`TERADATA_HOST`, `TERADATA_USER` và `TERADATA_PASSWORD`.

Trên Docker Desktop, `host.docker.internal` trỏ về máy host. Nếu Vantage Express
chạy trong VM, dùng IP của VM thay vì giá trị này và bảo đảm cổng Teradata `1025`
có thể truy cập được.

## 2. Chạy Qdrant

```bash
docker compose up -d qdrant
docker compose ps
curl -H "api-key: $(grep '^QDRANT_API_KEY=' .env | cut -d= -f2-)" \
  http://localhost:6333/healthz
```

- REST API: `http://localhost:6333`
- Dashboard: `http://localhost:6333/dashboard`
- gRPC: `localhost:6334`
- Dữ liệu bền vững: Docker volume `dbms_qdrant_data`

## 3. Build và kiểm tra Teradata

```bash
docker compose --profile teradata build teradata-client
docker compose --profile teradata run --rm teradata-client
```

Kết quả thành công: `Teradata connection is healthy`.

Để giữ cả Qdrant và Teradata toolbox chạy:

```bash
docker compose --profile teradata up -d --build
docker compose --profile teradata ps
```

## Lệnh nhanh

```bash
make config         # kiểm tra Compose sau khi nội suy biến
make build          # build Teradata client image
make up             # chạy Qdrant
make up-all         # chạy Qdrant + Teradata client
make test-qdrant    # gọi health endpoint Qdrant
make test-teradata  # mở container và kiểm tra kết nối Teradata
make down           # dừng container, giữ nguyên dữ liệu
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu Qdrant.

