#!/usr/bin/env bash

# TeamForge Start Script
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

setup_project() {
    log_info "Verificando entorno..."
    
    if ! check_command node; then
        log_error "Node.js es requerido. Instálalo desde https://nodejs.org/"
        exit 1
    fi
    
    if ! check_command npm; then
        log_error "npm es requerido"
        exit 1
    fi
    
    log_success "Node.js $(node --version) | npm $(npm --version)"
    
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependencias..."
        npm install
        if [ $? -ne 0 ]; then
            log_error "Error al instalar dependencias"
            exit 1
        fi
        log_success "Dependencias instaladas"
    else
        log_info "node_modules encontrado"
    fi
}

ask_port() {
    echo ""
    read -p "$(echo -e ${CYAN}Puerto [5173]:${NC}) " PORT
    PORT=${PORT:-5173}
}

show_menu() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           TEAMFORGE START (LOCAL)      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} Modo Desarrollo (npm run dev) - Hot Reload"
    echo -e "${GREEN}2)${NC} Build Producción (npm run build)"
    echo -e "${GREEN}3)${NC} Preview Build (npm run preview)"
    echo -e "${RED}4)${NC} Limpieza Completa (Todo lo generado)"
    echo -e "${YELLOW}5)${NC} Salir"
    echo ""
    read -p "$(echo -e ${CYAN}Selecciona una opción [1-5]:${NC}) " OPTION
}

start_dev() {
    ask_port
    setup_project
    echo ""
    log_info "Iniciando en modo DESARROLLO"
    log_info "La app estará disponible en http://localhost:$PORT"
    echo ""
    npm run dev -- --host 0.0.0.0 --port "$PORT"
}

start_build() {
    setup_project
    echo ""
    log_info "Construyendo para PRODUCCIÓN"
    npm run build
    if [ $? -ne 0 ]; then
        log_error "Error en el build"
        exit 1
    fi
    log_success "Build completado en ./dist"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

start_preview() {
    ask_port
    setup_project
    echo ""
    if [ ! -d "dist" ]; then
        log_warn "No existe carpeta dist. Ejecutando build primero..."
        npm run build
        if [ $? -ne 0 ]; then
            log_error "Error en el build"
            read -p "Presiona Enter para volver al menú..."
            return
        fi
    fi
    log_info "Previsualizando build de producción"
    log_info "La app estará disponible en http://localhost:$PORT"
    echo ""
    npm run preview -- --host 0.0.0.0 --port "$PORT"
}

clean_complete() {
    echo ""
    log_warn "LIMPIEZA COMPLETA"
    log_warn "Se eliminará: node_modules, dist, .vite, .cache, archivos temporales"
    echo ""
    read -p "¿Estás seguro? (s/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
        log_info "Cancelado"
        read -p "Presiona Enter para volver al menú..."
        return
    fi
    echo ""
    log_info "Limpiando..."
    rm -rf node_modules dist .vite .cache package-lock.json *.log 2>/dev/null
    log_success "Limpieza completa finalizada"
    echo ""
    read -p "Presiona Enter para volver al menú..."
}

while true; do
    show_menu
    case "$OPTION" in
        1) start_dev ;;
        2) start_build ;;
        3) start_preview ;;
        4) clean_complete ;;
        5) log_info "Saliendo..."; exit 0 ;;
        *) log_error "Opción inválida"; sleep 2 ;;
    esac
done
