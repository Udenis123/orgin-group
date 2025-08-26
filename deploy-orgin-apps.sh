#!/bin/bash

# Orgin Apps Deployment Script
# This script helps deploy and update the Orgin Angular applications

echo "=== Orgin Apps Deployment Script ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Function to build and deploy an app
deploy_app() {
    local app_name=$1
    local app_dir=$2
    local web_dir=$3
    
    print_status "Building $app_name..."
    cd "$app_dir" || exit 1
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $app_name..."
        npm install
    fi
    
    # Build the application
    print_status "Building $app_name for production..."
    npm run build --prod
    
    if [ $? -eq 0 ]; then
        print_status "Copying $app_name to web directory..."
        cp -r dist/*/* "$web_dir/"
        chown -R www-data:www-data "$web_dir"
        chmod -R 755 "$web_dir"
        print_status "$app_name deployed successfully!"
    else
        print_error "Failed to build $app_name"
        return 1
    fi
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates for subdomains..."
    
    # Check if DNS records are configured
    print_warning "Make sure DNS records are configured for the following subdomains:"
    echo "  - orgin-admin.orinest.rw"
    echo "  - orgin-website.orinest.rw"
    echo "  - orgin-analyzer.orinest.rw"
    echo "  - orgin-client.orinest.rw"
    echo ""
    read -p "Are DNS records configured? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Obtaining SSL certificates..."
        certbot certonly --apache \
            -d orgin-admin.orinest.rw \
            -d orgin-website.orinest.rw \
            -d orgin-analyzer.orinest.rw \
            -d orgin-client.orinest.rw \
            --non-interactive \
            --agree-tos \
            --email admin@orinest.rw
        
        if [ $? -eq 0 ]; then
            print_status "SSL certificates obtained successfully!"
            print_status "Reloading Apache..."
            systemctl reload apache2
        else
            print_error "Failed to obtain SSL certificates"
            print_warning "Please check DNS configuration and try again"
        fi
    else
        print_warning "Skipping SSL certificate setup. Please configure DNS records first."
    fi
}

# Main deployment process
main() {
    local base_dir="/var/www/deals/orgin-group"
    
    print_status "Starting deployment process..."
    
    # Deploy each application
    deploy_app "orgin-admin" "$base_dir/orgin-admin" "/var/www/orgin-admin"
    deploy_app "orgin-website" "$base_dir/orgin-aweb" "/var/www/orgin-website"
    deploy_app "orgin-analyzer" "$base_dir/orgin-analyzer" "/var/www/orgin-analyzer"
    deploy_app "orgin-client" "$base_dir/orgin-client" "/var/www/orgin-client"
    
    # Test Apache configuration
    print_status "Testing Apache configuration..."
    if apache2ctl configtest; then
        print_status "Apache configuration is valid"
        print_status "Reloading Apache..."
        systemctl reload apache2
    else
        print_error "Apache configuration test failed"
        exit 1
    fi
    
    print_status "Deployment completed successfully!"
    echo ""
    print_status "Your applications are now available at:"
    echo "  - https://orgin-admin.orinest.rw"
    echo "  - https://orgin-website.orinest.rw"
    echo "  - https://orgin-analyzer.orinest.rw"
    echo "  - https://orgin-client.orinest.rw"
    echo ""
    print_warning "Note: SSL certificates need to be configured for HTTPS to work"
    echo ""
    
    # Ask if user wants to setup SSL
    read -p "Do you want to setup SSL certificates now? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
}

# Check command line arguments
case "${1:-}" in
    "ssl")
        setup_ssl
        ;;
    "deploy")
        main
        ;;
    *)
        echo "Usage: $0 {deploy|ssl}"
        echo "  deploy - Build and deploy all applications"
        echo "  ssl    - Setup SSL certificates for subdomains"
        exit 1
        ;;
esac
