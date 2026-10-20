import os
import sys

import teradatasql


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def main() -> int:
    try:
        connection = teradatasql.connect(
            host=required("TERADATA_HOST"),
            user=required("TERADATA_USER"),
            password=required("TERADATA_PASSWORD"),
            logmech=os.getenv("TERADATA_LOGMECH", "TD2"),
            encryptdata=os.getenv("TERADATA_ENCRYPTDATA", "true"),
        )
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        finally:
            connection.close()
    except Exception as exc:
        print(f"Teradata connection failed: {exc}", file=sys.stderr)
        return 1

    print("Teradata connection is healthy")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

