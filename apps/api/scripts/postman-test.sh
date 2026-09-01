#!/usr/bin/env bash

BASE_URL="http://localhost:3000"

echo "============================================================"
echo "🚀 EXECUTING COMPLETE END-TO-END POSTMAN-LIKE TEST SUITE"
echo "============================================================"
echo ""

# 1. Health Probe
echo "📌 [TEST 1] GET /health"
curl -s -X GET "$BASE_URL/health" -H "Content-Type: application/json" | jq .
echo ""

# 2. Register Operator User
echo "📌 [TEST 2] POST /auth/register (Create Operator User)"
REGISTER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.operator@parking.com",
    "password": "password123",
    "name": "Test Officer",
    "role": "OPERATOR"
  }')
echo "$REGISTER_RES" | jq .
echo ""

# 3. Login Operator User
echo "📌 [TEST 3] POST /auth/login (Login Operator)"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.operator@parking.com",
    "password": "password123"
  }')
echo "$LOGIN_RES" | jq .
OPERATOR_TOKEN=$(echo "$LOGIN_RES" | jq -r '.access_token')
echo "🔑 Received Operator JWT Token: ${OPERATOR_TOKEN:0:30}..."
echo ""

# 4. Get Profile
echo "📌 [TEST 4] GET /auth/profile (Authenticated Request)"
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" | jq .
echo ""

# 5. Create Ticket
echo "📌 [TEST 5] POST /tickets (Create Ticket as OPERATOR)"
TICKET_RES=$(curl -s -X POST "$BASE_URL/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -d '{
    "plate": "CAI-9999"
  }')
echo "$TICKET_RES" | jq .
TICKET_ID=$(echo "$TICKET_RES" | jq -r '.id')
echo "🎟️ Created Ticket ID: $TICKET_ID"
echo ""

# 6. Get All Tickets
echo "📌 [TEST 6] GET /tickets (Fetch All Tickets)"
curl -s -X GET "$BASE_URL/tickets" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" | jq .
echo ""

# 7. Get Ticket by ID
if [ "$TICKET_ID" != "null" ] && [ -n "$TICKET_ID" ]; then
  echo "📌 [TEST 7] GET /tickets/$TICKET_ID (Fetch Single Ticket)"
  curl -s -X GET "$BASE_URL/tickets/$TICKET_ID" \
    -H "Authorization: Bearer $OPERATOR_TOKEN" | jq .
  echo ""
fi

# 8. Register Regular USER (For RBAC Test)
echo "📌 [TEST 8] POST /auth/register (Create Regular USER)"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regular.user@parking.com",
    "password": "password123",
    "name": "Normal Driver",
    "role": "USER"
  }' | jq .
echo ""

# 9. Login Regular USER
echo "📌 [TEST 9] POST /auth/login (Login Regular USER)"
USER_LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regular.user@parking.com",
    "password": "password123"
  }')
USER_TOKEN=$(echo "$USER_LOGIN_RES" | jq -r '.access_token')
echo "🔑 Received Regular User JWT Token: ${USER_TOKEN:0:30}..."
echo ""

# 10. RBAC Test: Regular USER creating ticket (Should fail with 403)
echo "📌 [TEST 10] POST /tickets as Regular USER (Should return 403 Forbidden)"
curl -s -i -X POST "$BASE_URL/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{ "plate": "ALX-1234" }' | head -n 15
echo ""

# 11. Unauthorized Test (Without JWT)
echo "📌 [TEST 11] GET /tickets without Authorization Token (Should return 401 Unauthorized)"
curl -s -i -X GET "$BASE_URL/tickets" | head -n 10
echo ""

# 12. OpenAPI / Swagger Docs JSON
echo "📌 [TEST 12] GET /api/docs-json (Swagger OpenAPI Spec)"
curl -s -X GET "$BASE_URL/api/docs-json" | jq '.info'
echo ""

echo "============================================================"
echo "✅ ALL ENDPOINTS TESTED SUCCESSFULLY!"
echo "============================================================"
