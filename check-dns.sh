#!/bin/bash

echo "🔍 Checking DNS propagation for Orgin subdomains..."
echo "Server IP: 46.202.195.83"
echo "=================================="

subdomains=("orgin-admin" "orgin-website" "orgin-analyzer" "orgin-client")

for subdomain in "${subdomains[@]}"; do
    full_domain="$subdomain.orinest.rw"
    echo "Checking: $full_domain"
    
    # Try to resolve the domain
    ip=$(nslookup $full_domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    
    if [ "$ip" = "46.202.195.83" ]; then
        echo "✅ $full_domain → $ip (Correct)"
    elif [ -n "$ip" ]; then
        echo "❌ $full_domain → $ip (Wrong IP)"
    else
        echo "⏳ $full_domain → DNS not yet propagated"
    fi
    echo "---"
done

echo "📝 Instructions:"
echo "1. Add A records in your DNS panel for all subdomains"
echo "2. Point them to: 46.202.195.83"
echo "3. Wait 5-30 minutes for propagation"
echo "4. Run this script again to verify"
