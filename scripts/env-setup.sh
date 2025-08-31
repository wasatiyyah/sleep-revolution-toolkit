#!/bin/bash

# ===========================================
# ENVIRONMENT SETUP SCRIPT
# ===========================================
# This script helps you set up environment variables
# for the Sleep Toolkit website

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}  SLEEP TOOLKIT - ENV SETUP${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main function
main() {
    print_header
    
    # Check if .env already exists
    if [ -f ".env" ]; then
        print_warning ".env file already exists!"
        echo "Do you want to:"
        echo "1) Keep existing .env and exit"
        echo "2) Backup existing .env and create new one"
        echo "3) Overwrite existing .env"
        read -p "Choose (1-3): " choice
        
        case $choice in
            1)
                print_info "Keeping existing .env file. Exiting..."
                exit 0
                ;;
            2)
                mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
                print_success "Backed up existing .env file"
                ;;
            3)
                print_warning "Will overwrite existing .env file"
                ;;
            *)
                print_error "Invalid choice. Exiting..."
                exit 1
                ;;
        esac
    fi
    
    # Check if .env.example exists
    if [ ! -f ".env.example" ]; then
        print_error ".env.example file not found!"
        print_info "Please make sure you're in the project root directory"
        exit 1
    fi
    
    # Copy .env.example to .env
    cp .env.example .env
    print_success "Created .env from template"
    
    # Set secure permissions
    chmod 600 .env
    print_success "Set secure permissions (600) on .env file"
    
    # Interactive setup
    echo ""
    print_info "Let's set up your environment variables..."
    echo ""
    
    # Stripe setup
    setup_stripe
    
    # Google Analytics setup
    setup_google_analytics
    
    # Ask if user wants to set up additional services
    echo ""
    read -p "Do you want to set up additional services? (y/n): " setup_more
    
    if [[ $setup_more =~ ^[Yy]$ ]]; then
        setup_additional_services
    fi
    
    # Final steps
    echo ""
    print_success "Environment setup complete!"
    echo ""
    print_info "Next steps:"
    echo "1. Review your .env file and fill in any missing values"
    echo "2. Test your configuration by running the website"
    echo "3. Set up production environment variables in your deployment platform"
    echo ""
    print_warning "IMPORTANT: Never commit .env files to version control!"
    
    # Verify .env is in .gitignore
    if grep -q "\.env" .gitignore; then
        print_success ".env is properly ignored in .gitignore"
    else
        print_error ".env is NOT in .gitignore - this is a security risk!"
    fi
}

setup_stripe() {
    echo -e "${BLUE}--- STRIPE CONFIGURATION ---${NC}"
    print_info "Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys"
    
    read -p "Enter your Stripe TEST Publishable Key (pk_test_...): " stripe_test_pub
    if [[ $stripe_test_pub =~ ^pk_test_ ]]; then
        sed -i.bak "s/STRIPE_PUBLISHABLE_KEY_TEST=.*/STRIPE_PUBLISHABLE_KEY_TEST=$stripe_test_pub/" .env
        print_success "Stripe test publishable key saved"
    else
        print_warning "Invalid Stripe test publishable key format"
    fi
    
    read -p "Enter your Stripe TEST Secret Key (sk_test_...): " stripe_test_secret
    if [[ $stripe_test_secret =~ ^sk_test_ ]]; then
        sed -i.bak "s/STRIPE_SECRET_KEY_TEST=.*/STRIPE_SECRET_KEY_TEST=$stripe_test_secret/" .env
        print_success "Stripe test secret key saved"
    else
        print_warning "Invalid Stripe test secret key format"
    fi
    
    # Clean up backup file
    rm -f .env.bak
}

setup_google_analytics() {
    echo ""
    echo -e "${BLUE}--- GOOGLE ANALYTICS ---${NC}"
    print_info "Get your GA4 Measurement ID from: https://analytics.google.com"
    
    read -p "Enter your GA4 Measurement ID (G-XXXXXXXXXX): " ga4_id
    if [[ $ga4_id =~ ^G- ]]; then
        sed -i.bak "s/GA4_MEASUREMENT_ID=.*/GA4_MEASUREMENT_ID=$ga4_id/" .env
        print_success "Google Analytics ID saved"
    else
        print_warning "Invalid GA4 Measurement ID format (should start with G-)"
    fi
    
    # Clean up backup file
    rm -f .env.bak
}

setup_additional_services() {
    echo ""
    echo -e "${BLUE}--- ADDITIONAL SERVICES ---${NC}"
    
    # Google Tag Manager
    read -p "Enter your Google Tag Manager Container ID (GTM-XXXXXXX): " gtm_id
    if [[ $gtm_id =~ ^GTM- ]]; then
        sed -i.bak "s/GTM_CONTAINER_ID=.*/GTM_CONTAINER_ID=$gtm_id/" .env
        print_success "Google Tag Manager ID saved"
    else
        print_warning "Skipping GTM (invalid format or empty)"
    fi
    
    # Facebook Pixel
    read -p "Enter your Facebook Pixel ID (15 digits): " fb_pixel
    if [[ $fb_pixel =~ ^[0-9]{15}$ ]]; then
        sed -i.bak "s/FACEBOOK_PIXEL_ID=.*/FACEBOOK_PIXEL_ID=$fb_pixel/" .env
        print_success "Facebook Pixel ID saved"
    else
        print_warning "Skipping Facebook Pixel (invalid format or empty)"
    fi
    
    # Email setup
    read -p "Enter your email for notifications (optional): " email
    if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        sed -i.bak "s/SMTP_USER=.*/SMTP_USER=$email/" .env
        sed -i.bak "s/FROM_EMAIL=.*/FROM_EMAIL=noreply@$(echo $email | cut -d'@' -f2)/" .env
        print_success "Email configuration saved"
    else
        print_warning "Skipping email setup (invalid format or empty)"
    fi
    
    # Clean up backup file
    rm -f .env.bak
}

# Validation function
validate_env() {
    print_info "Validating environment configuration..."
    
    source .env
    
    # Check required variables
    required_vars=(
        "STRIPE_PUBLISHABLE_KEY_TEST"
        "STRIPE_SECRET_KEY_TEST"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_success "All required environment variables are set"
        return 0
    else
        print_error "Missing required variables: ${missing_vars[*]}"
        return 1
    fi
}

# Help function
show_help() {
    echo "Environment Setup Script for Sleep Toolkit Website"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --validate Validate existing .env file"
    echo "  --production   Set up production environment"
    echo ""
    echo "Examples:"
    echo "  $0              # Interactive setup"
    echo "  $0 --validate   # Validate current .env"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--validate)
        if [ -f ".env" ]; then
            validate_env
        else
            print_error ".env file not found"
            exit 1
        fi
        exit $?
        ;;
    --production)
        print_info "Setting up production environment..."
        # Add production-specific setup here
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac