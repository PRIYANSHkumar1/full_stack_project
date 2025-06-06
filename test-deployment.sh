#!/bin/bash

# Deployment Test Script for MERN Stack E-commerce App
# This script helps test logout functionality and other critical features

echo "==================================="
echo "MERN Stack Deployment Test Suite"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_URL="https://full-stack-project-backend-n1gf.onrender.com"
FRONTEND_URL="https://full-stack-project-frontend-6cyo.onrender.com"
LOCAL_BACKEND="http://localhost:4000"
LOCAL_FRONTEND="http://localhost:3000"

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($response)"
        return 1
    fi
}

# Function to test CORS
test_cors() {
    local backend_url=$1
    local frontend_origin=$2
    local description=$3
    
    echo -n "Testing CORS $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $frontend_origin" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        "$backend_url/api/v1/users/logout" \
        --max-time 10)
    
    if [ "$response" = "200" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} ($response)"
        return 1
    fi
}

# Function to test logout endpoint specifically
test_logout_endpoint() {
    local backend_url=$1
    local description=$2
    
    echo -n "Testing logout endpoint $description... "
    
    # Test OPTIONS request first (CORS preflight)
    options_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X OPTIONS \
        "$backend_url/api/v1/users/logout" \
        --max-time 10)
    
    # Test POST request (actual logout)
    post_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        "$backend_url/api/v1/users/logout" \
        --max-time 10)
    
    if [ "$options_response" = "200" ] || [ "$options_response" = "204" ]; then
        if [ "$post_response" = "401" ] || [ "$post_response" = "200" ]; then
            echo -e "${GREEN}✓ PASS${NC} (OPTIONS: $options_response, POST: $post_response)"
            return 0
        else
            echo -e "${YELLOW}⚠ PARTIAL${NC} (OPTIONS: $options_response, POST: $post_response)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (OPTIONS: $options_response, POST: $post_response)"
        return 1
    fi
}

echo -e "${YELLOW}Starting deployment tests...${NC}\n"

# Test health endpoints
echo "1. Health Check Tests:"
test_endpoint "$BACKEND_URL/api/v1/health" "Production Backend Health"
test_endpoint "$LOCAL_BACKEND/api/v1/health" "Local Backend Health" || echo -e "${YELLOW}   (Local backend not running - this is normal)${NC}"

echo ""

# Test main endpoints
echo "2. Main Endpoint Tests:"
test_endpoint "$BACKEND_URL/api/v1/products" "Production Products API"
test_endpoint "$FRONTEND_URL" "Production Frontend"

echo ""

# Test CORS configuration
echo "3. CORS Configuration Tests:"
test_cors "$BACKEND_URL" "$FRONTEND_URL" "Production to Production"
test_cors "$LOCAL_BACKEND" "$LOCAL_FRONTEND" "Local to Local" || echo -e "${YELLOW}   (Local servers not running - this is normal)${NC}"

echo ""

# Test logout functionality specifically
echo "4. Logout Functionality Tests:"
test_logout_endpoint "$BACKEND_URL" "Production"
test_logout_endpoint "$LOCAL_BACKEND" "Local" || echo -e "${YELLOW}   (Local backend not running - this is normal)${NC}"

echo ""

# Network connectivity tests
echo "5. Network Connectivity Tests:"
echo -n "Testing DNS resolution... "
if nslookup full-stack-project-backend-n1gf.onrender.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

echo -n "Testing SSL certificate... "
if curl -s --head https://full-stack-project-backend-n1gf.onrender.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

echo ""

# Summary
echo "==================================="
echo -e "${GREEN}Deployment test completed!${NC}"
echo "==================================="
echo ""
echo "If any tests failed, check the following:"
echo "1. Ensure both frontend and backend are deployed and running"
echo "2. Check CORS configuration in backend server.js"
echo "3. Verify environment variables are set correctly"
echo "4. Check cookie settings in generateToken.js and logoutUser function"
echo "5. Review network connectivity and DNS resolution"
echo ""
echo "For logout issues specifically:"
echo "- Check browser dev tools for cookie and network errors"
echo "- Verify SameSite and Secure cookie settings"
echo "- Test in incognito mode to rule out cache issues"
echo "- Check backend logs for authentication errors"
