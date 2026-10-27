#!/usr/bin/env bash

# TeamForge Docker Start Script
# Interactive menu

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 no está instalado"
        return 1
    fi
    return 0
}

create_dockerfile_dev() {
    if [ -f "Dockerfile.dev" ]; then
        return
    fi
    log_info "Creando Dockerfile.dev..."
    cat > Dockerfile.dev << 'DOCKERFILE'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
DOCKERFILE
    log_success "Dockerfile.dev creado"
}

create_dockerfile() {
    if [ -f "Dockerfile" ]; then
        return
    fi
    log_info "Creando Dockerfile (multi-stage)..."
    cat > Dockerfile << 'DOCKERFILE'
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE
    log_success "Dockerfile creado"
}

create_nginx_conf() {
    if [ -f "nginx.conf" ]; then
        return
    fi
    log_info "Creando nginx.conf..."
    cat > nginx.conf << 'NGINX'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
NGINX
    log_success "nginx.conf creado"
}

create_docker_compose_dev() {
    if [ -f "docker-compose.dev.yml" ]; then
        return
    fi
    log_info "Creando docker-compose.dev.yml..."
    cat > docker-compose.dev.yml << COMPOSE
version: '3.8'

services:
  teamforge-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "${PORT}:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    stdin_open: true
    tty: true
COMPOSE
    log_success "docker-compose.dev.yml creado"
}

create_docker_compose() {
    if [ -f "docker-compose.yml" ]; then
        return
    fi
    log_info "Creando docker-compose.yml..."
    cat > docker-compose.yml << COMPOSE
version: '3.8'

services:
  teamforge:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${PORT}:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
COMPOSE
    log_success "docker-compose.yml creado"
}

ask_port() {
    echo ""
    read -p "$(echo -e ${CYAN}Puerto [5173]:${NC}) " PORT
    PORT=${PORT:-5173}
}

show_menu() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║        TEAMFORGE START (DOCKER)        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} Modo Desarrollo con Docker (dev + hot-reload)"
    echo -e "${GREEN}2)${NC} Modo Producción con Docker (build + nginx)"
    echo -e "${RED}3)${NC} Detener y Limpiar Contenedores"
    echo -e "${YELLOW}4)${NC} Limpieza Completa (Contenedores + Imágenes + Archivos)"
    echo -e "${CYAN}5)${NC} Limpiar Solo Archivos Docker Generados"
    echo -e "${BLUE}6)${NC} Salir"
    echo ""
    read -p "$(echo -e ${CYAN}Selecciona una opción [1-6]:${NC}) " OPTION
}

start_dev_docker() {
    if ! check_command docker; then
        log_error "Docker no está instalado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    if ! check_command docker compose; then
        log_error "docker compose no está disponible"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    
    ask_port
    echo ""
    log_info "Iniciando TeamForge en modo DESARROLLO con Docker"
    log_info "La app estará disponible en http://localhost:$PORT"
    echo ""
    
    create_dockerfile_dev
    create_docker_compose_dev
    
    docker compose -f docker-compose.dev.yml up --build
}

start_build_docker() {
    if ! check_command docker; then
        log_error "Docker no está instalado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    if ! check_command docker compose; then
        log_error "docker compose no está disponible"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    
    ask_port
    echo ""
    log_info "Construyging y levantando TeamForge en modo PRODUCCIÓN con Docker"
    log_info "La app estará disponible en http://localhost:$PORT"
    echo ""
    
    create_dockerfile
    create_nginx_conf
    create_docker_compose
    
    docker compose up --build -d
    log_success "Contenedor levantado en segundo plano"
    log_info "Ver logs: docker compose logs -f"
    log_info "Detener: docker compose down"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

stop_and_clean() {
    if ! check_command docker; then
        log_error "Docker no está instalado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    echo ""
    log_info "Deteniendo contenedores de TeamForge..."
    docker compose down 2>/dev/null
    docker compose -f docker-compose.dev.yml down 2>/dev/null
    docker ps -a --filter "name=teamforge" -q | xargs -r docker rm -f 2>/dev/null
    log_success "Contenedores detenidos y eliminaridos"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

clean_all_docker() {
    if ! check_command docker; then
        log_error "Docker no está instalado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    echo ""
    log_warn "LIMPIEZA COMPLETA DOCKER"
    log_warn "Se eliminarán: contenedores, imágenes, volúmenes, archivos Docker generados"
    echo ""
    read -p "¿Estás seguro? (s/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
        log_info "Cancelado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    echo ""
    log_info "Deteniendo y eliminando..."
    docker compose down -v 2>/dev/null
    docker compose -f docker-compose.dev.yml down -v 2>/dev/null
    docker ps -a --filter "name=teamforge" -q | xargs -r docker rm -f 2>/dev/null
    docker images --filter "reference=*teamforge*" -q | xargs -r docker rmi -f 2>/dev/null
    rm -f Dockerfile Dockerfile.dev docker-compose.yml docker-compose.dev.yml nginx.conf
    log_success "Limpieza completa de Docker finalizada"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

clean_docker_files() {
    echo ""
    log_info "Limpiando solo archivos Docker generados..."
    docker compose down 2>/dev/null
    docker compose -f docker-compose.dev.yml down 2>/dev/null
    rm -f Dockerfile Dockerfile.dev docker-compose.yml docker-compose.dev.yml nginx.conf
    log_success "Archivos Docker generados eliminados"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

while true; do
    show_menu
    case "$OPTION" in
        1) start_dev_docker ;;
        2) start_build_docker ;;
        3) stop_and_clean ;;
        4) clean_all_docker ;;
        5) clean_docker_files ;;
        6) log_info "Saliendo..."; exit 0 ;;
        *) log_error "Opción inválida"; sleep 2 ;;
    esac
done
