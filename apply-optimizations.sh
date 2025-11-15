#!/bin/bash
# VCB-Web Performance Optimization Script
# Applies safe performance improvements without changing look and feel

set -e

echo "🚀 VCB-Web Performance Optimization Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backup directory
BACKUP_DIR=".backup-$(date +%Y%m%d-%H%M%S)"

# Function to create backup
create_backup() {
    echo -e "${YELLOW}📦 Creating backup in $BACKUP_DIR...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp *.html "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created${NC}"
    echo ""
}

# Function to add lazy loading to specific large images
add_lazy_loading() {
    echo -e "${YELLOW}📸 Adding lazy loading to large images...${NC}"

    # Add lazy loading to LIANELA-Laptop.png (355KB)
    if [ -f "Partnerships.html" ]; then
        sed -i 's/src="images\/LIANELA-Laptop\.png" alt="LIANELA V3 preview on laptop"/src="images\/LIANELA-Laptop.png" alt="LIANELA V3 preview on laptop" loading="lazy"/g' Partnerships.html
        echo -e "${GREEN}✓ Partnerships.html updated${NC}"
    fi

    # Add lazy loading to pitch deck logo
    if [ -f "vcb_pitch_deck_html.html" ]; then
        sed -i 's/<img src="images\/logo-transparent-Black-Back\.png" alt="VCB Logo">/<img src="images\/logo-transparent-Black-Back.png" alt="VCB Logo" loading="lazy">/g' vcb_pitch_deck_html.html
        echo -e "${GREEN}✓ vcb_pitch_deck_html.html updated${NC}"
    fi

    # Add lazy loading to prospectus logo
    if [ -f "vcb-master-prospectus.html" ]; then
        sed -i 's/src="images\/logo-transparent-Black-Back\.png" alt="VCB Logo"/src="images\/logo-transparent-Black-Back.png" alt="VCB Logo" loading="lazy"/g' vcb-master-prospectus.html
        echo -e "${GREEN}✓ vcb-master-prospectus.html updated${NC}"
    fi

    # Add lazy loading to sarah.html logo
    if [ -f "sarah.html" ]; then
        sed -i 's/src="images\/logo-transparent-Black-Back\.png" alt="VCB Logo" class="logo"/src="images\/logo-transparent-Black-Back.png" alt="VCB Logo" class="logo" loading="lazy"/g' sarah.html
        echo -e "${GREEN}✓ sarah.html updated${NC}"
    fi

    echo ""
}

# Function to add resource hints
add_resource_hints() {
    echo -e "${YELLOW}🔗 Adding resource hints (dns-prefetch, preconnect)...${NC}"

    for file in *.html; do
        # Check if file already has preconnect hints
        if ! grep -q "dns-prefetch" "$file"; then
            # Add resource hints after <meta charset> or <meta name="viewport">
            sed -i '/<meta.*charset\|<meta name="viewport"/a\  <!-- Performance: Resource Hints -->\n  <link rel="dns-prefetch" href="https://fonts.googleapis.com">\n  <link rel="dns-prefetch" href="https://fonts.gstatic.com">\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' "$file"
            echo -e "${GREEN}✓ $file updated${NC}"
        fi
    done

    echo ""
}

# Function to check for Tailwind CDN usage
check_tailwind_cdn() {
    echo -e "${YELLOW}⚠️  Checking for Tailwind CDN usage (production warning)...${NC}"

    if grep -l "cdn.tailwindcss.com" *.html > /dev/null 2>&1; then
        echo -e "${RED}❌ WARNING: Tailwind CDN found in production files:${NC}"
        grep -l "cdn.tailwindcss.com" *.html
        echo -e "${YELLOW}   This should be replaced with static CSS for production.${NC}"
        echo -e "${YELLOW}   See PERFORMANCE-OPTIMIZATIONS.md for details.${NC}"
    else
        echo -e "${GREEN}✓ No Tailwind CDN usage found${NC}"
    fi

    echo ""
}

# Function to analyze file sizes
analyze_sizes() {
    echo -e "${YELLOW}📊 File Size Analysis:${NC}"
    echo ""
    echo "HTML Files (largest first):"
    du -h *.html 2>/dev/null | sort -rh | head -10
    echo ""
    echo "Images:"
    du -h images/ 2>/dev/null
    echo ""
    echo "Total project size:"
    du -sh .
    echo ""
}

# Main execution
main() {
    echo "This script will apply safe performance optimizations."
    echo "A backup will be created before making any changes."
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi

    echo ""

    # Create backup
    create_backup

    # Apply optimizations
    add_lazy_loading
    add_resource_hints
    check_tailwind_cdn
    analyze_sizes

    echo -e "${GREEN}=========================================="
    echo -e "✅ Optimizations applied successfully!"
    echo -e "==========================================${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Review changes: git diff"
    echo "   2. Test locally: python3 -m http.server 8080"
    echo "   3. Run image optimization: ./optimize-images.sh"
    echo "   4. Review full plan: cat PERFORMANCE-OPTIMIZATIONS.md"
    echo ""
    echo "💾 Backup location: $BACKUP_DIR"
    echo "   Restore with: cp $BACKUP_DIR/*.html ."
    echo ""
}

# Run main function
main
