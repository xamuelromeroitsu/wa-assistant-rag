#!/usr/bin/env bash
# setup-db.sh — levanta y verifica PostgreSQL + pgvector para Wa-Assistant RAG
# Uso: ./scripts/setup-db.sh
set -euo pipefail

err()  { echo "[ERROR] $*" >&2; }
info() { echo "[INFO] $*"; }
ok()   { echo "[ OK ] $*"; }

# ---- Paso 1: prerrequisitos ----
if command -v podman >/dev/null 2>&1; then
  ENGINE="podman"
  COMPOSE="podman compose"
elif command -v docker >/dev/null 2>&1; then
  ENGINE="docker"
  COMPOSE="docker compose"
else
  err "No se encontró podman ni docker. Instalá Podman: https://podman.io/docs/installation"
  exit 1
fi

[ -f ".env.example" ] || { err "Falta .env.example en la raíz del repositorio."; exit 1; }
[ -f "scripts/init-db.sql" ] || { err "Falta scripts/init-db.sql."; exit 1; }

# ---- Paso 2: crear/cargar .env ----
if [ ! -f ".env" ]; then
  cp .env.example .env
  info "Se creó .env desde .env.example"
fi

# docker-compose.yml inyecta POSTGRES_PASSWORD desde PGPASSWORD del entorno/.env
set -a
# shellcheck disable=SC1091
. ./.env
set +a

if [ -z "${PGPASSWORD:-}" ]; then
  err "PGPASSWORD no está definido en .env (lo necesita docker-compose.yml)."
  exit 1
fi
if [ "$PGPASSWORD" = "tu_password_segura" ]; then
  info "AVISO: PGPASSWORD sigue con el placeholder de .env.example (aceptable solo en desarrollo local)."
fi

DB_CONTAINER="wa-assistant-db"
DB_NAME="${PGDATABASE:-wa_assistant}"
DB_USER="${PGUSER:-postgres}"

# Estado previo: el auto-init de init-db.sql solo corre en volúmenes nuevos.
# Nombre del volumen = <nombre del proyecto>_pgdata (proyecto = nombre del directorio)
vol_existe=false
if "$ENGINE" volume ls -q 2>/dev/null | grep -qx 'wa-assistant-rag_pgdata'; then
  vol_existe=true
fi

# ---- Paso 3: levantar contenedor ----
info "Levantando contenedor ($COMPOSE up -d)..."
$COMPOSE up -d

# Espera activa a que PostgreSQL acepte conexiones (máx 30 s)
for i in $(seq 1 15); do
  if podman exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    break
  fi
  [ "$i" -eq 15 ] && { err "PostgreSQL no respondió en 30 s. Revisá: $COMPOSE logs db"; exit 1; }
  sleep 2
done
ok "PostgreSQL aceptando conexiones"

# ---- Paso 4: verificar esquema ----
tablas=$(podman exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('documents','chunks','embeddings','sessions');")

if [ "$tablas" -eq 4 ]; then
  ok "Esquema verificado: 4 tablas (documents, chunks, embeddings, sessions)"
  podman exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT extname FROM pg_extension WHERE extname='vector';" | grep -q vector \
    && ok "Extensión pgvector habilitada" \
    || err "La extensión vector no está habilitada (revisá scripts/init-db.sql)"
else
  if [ "$vol_existe" = true ]; then
    err "Faltan tablas ($tablas/4) y el volumen pgdata ya existía."
    err "init-db.sql solo se ejecuta al CREAR el volumen. Para re-ejecutarlo (BORRA datos):"
    err "  $COMPOSE down -v && ./scripts/setup-db.sh"
    exit 1
  fi
  err "Faltan tablas ($tablas/4) en un volumen nuevo: scripts/init-db.sql no se aplicó."
  err "Revisá el SQL y los volúmenes de docker-compose.yml. Detalle: $COMPOSE logs db"
  exit 1
fi

docs_count=$(podman exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM documents;")
ok "Consulta de prueba OK (documents: $docs_count filas)"

# ---- Paso 5: resumen ----
echo
ok "Base de datos lista."
info "Conexión manual: podman exec -it $DB_CONTAINER psql -U $DB_USER -d $DB_NAME"
info "Siguiente paso: ollama pull llama3.2 && ollama pull nomic-embed-text"
