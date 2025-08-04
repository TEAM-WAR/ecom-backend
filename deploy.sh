#!/bin/bash

# Script de déploiement pour ecom-backend
# Usage: ./deploy.sh [start|stop|restart|build|logs|status]

set -e

SERVICE_NAME="ecom-backend"
COMPOSE_FILE="docker-compose.yml"
PORT=5000

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour arrêter les services
stop_services() {
    log_info "Arrêt des services $SERVICE_NAME..."
    docker-compose down
    log_info "Services $SERVICE_NAME arrêtés"
}

# Fonction pour construire l'image
build_image() {
    log_info "Construction de l'image Docker..."
    docker-compose build --no-cache
    log_info "Image construite avec succès"
}

# Fonction pour démarrer les services
start_services() {
    log_info "Démarrage des services $SERVICE_NAME..."
    docker-compose up -d
    log_info "Services $SERVICE_NAME démarrés sur le port $PORT"
    log_info "API accessible sur: http://localhost:$PORT"
}

# Fonction pour afficher le statut
show_status() {
    echo "=== Statut de l'API ecom-backend ==="
    echo ""
    
    # Statut des conteneurs
    if docker-compose ps | grep -q "Up"; then
        log_info "Services $SERVICE_NAME sont en cours d'exécution"
        docker-compose ps
    else
        log_warn "Services $SERVICE_NAME ne sont pas en cours d'exécution"
    fi
    
    echo ""
    
    # Test de connectivité API
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
        log_info "API répond correctement sur http://localhost:$PORT"
        
        # Test d'un endpoint spécifique
        echo ""
        log_info "Test de l'endpoint principal:"
        curl -s http://localhost:$PORT | head -3
    else
        log_error "API ne répond pas sur http://localhost:$PORT"
    fi
}

# Fonction pour afficher les logs
show_logs() {
    if docker-compose ps | grep -q "Up"; then
        docker-compose logs -f
    else
        log_error "Services $SERVICE_NAME ne sont pas en cours d'exécution"
        exit 1
    fi
}

# Fonction pour nettoyer
cleanup() {
    log_info "Nettoyage des ressources Docker..."
    docker-compose down --volumes --remove-orphans
    docker image prune -f
    log_info "Nettoyage terminé"
}

# Gestion des arguments
case "${1:-}" in
    "start")
        stop_services
        start_services
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        show_status
        ;;
    "build")
        build_image
        ;;
    "rebuild")
        stop_services
        build_image
        start_services
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|build|rebuild|logs|status|cleanup}"
        echo ""
        echo "Commandes disponibles:"
        echo "  start   - Démarrer l'API"
        echo "  stop    - Arrêter l'API"
        echo "  restart - Redémarrer l'API"
        echo "  build   - Construire l'image Docker"
        echo "  rebuild - Reconstruire et redémarrer l'API"
        echo "  logs    - Afficher les logs en temps réel"
        echo "  status  - Afficher le statut de l'API"
        echo "  cleanup - Nettoyer les ressources Docker"
        exit 1
        ;;
esac 