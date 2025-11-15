#!/bin/bash
# Image Optimization Script
# Requires: imagemagick or cwebp

echo "🖼️  VCB-Web Image Optimization Script"
echo "======================================"

# Check for tools
if command -v cwebp &> /dev/null; then
    TOOL="cwebp"
    echo "✓ Found cwebp"
elif command -v convert &> /dev/null; then
    TOOL="imagemagick"
    echo "✓ Found ImageMagick"
else
    echo "❌ Error: No image optimization tool found"
    echo "Please install one of:"
    echo "  - webp: sudo apt-get install webp"
    echo "  - imagemagick: sudo apt-get install imagemagick"
    exit 1
fi

# Create optimized versions
cd images

echo ""
echo "Optimizing PNG images to WebP..."

for img in *.png; do
    if [ -f "$img" ]; then
        base="${img%.*}"
        webp="${base}.webp"

        if [ "$TOOL" = "cwebp" ]; then
            cwebp -q 85 "$img" -o "$webp"
        else
            convert "$img" -quality 85 "$webp"
        fi

        original_size=$(du -h "$img" | cut -f1)
        new_size=$(du -h "$webp" | cut -f1)
        echo "  ✓ $img ($original_size) → $webp ($new_size)"
    fi
done

echo ""
echo "Optimizing JPG images to WebP..."

for img in *.jpg *.jpeg; do
    if [ -f "$img" ]; then
        base="${img%.*}"
        webp="${base}.webp"

        if [ "$TOOL" = "cwebp" ]; then
            cwebp -q 85 "$img" -o "$webp"
        else
            convert "$img" -quality 85 "$webp"
        fi

        original_size=$(du -h "$img" | cut -f1)
        new_size=$(du -h "$webp" | cut -f1)
        echo "  ✓ $img ($original_size) → $webp ($new_size)"
    fi
done

echo ""
echo "✅ Image optimization complete!"
echo ""
echo "Next steps:"
echo "1. Update HTML to use <picture> elements with WebP + fallback"
echo "2. Keep original images for fallback support"
echo ""
echo "Example usage:"
echo '<picture>'
echo '  <source srcset="images/logo.webp" type="image/webp">'
echo '  <img src="images/logo.png" alt="Logo" loading="lazy">'
echo '</picture>'
