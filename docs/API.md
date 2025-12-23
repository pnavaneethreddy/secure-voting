# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU123456"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST /auth/login
Authenticate user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/generate-otp
Generate OTP for voting (requires auth).

**Response:**
```json
{
  "message": "OTP sent to your email"
}
```

#### POST /auth/verify-otp
Verify OTP code (requires auth).

**Body:**
```json
{
  "otp": "123456"
}
```

#### GET /auth/me
Get current user info (requires auth).

### Elections

#### GET /elections
Get all active elections (requires auth).

**Response:**
```json
[
  {
    "_id": "election_id",
    "title": "Student Council Election",
    "description": "Annual student council election",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-07T23:59:59Z",
    "candidates": [...],
    "hasVoted": false,
    "currentStatus": "active"
  }
]
```

#### GET /elections/:id
Get specific election details (requires auth).

#### GET /elections/:id/results
Get election results (requires auth).

**Response:**
```json
{
  "electionId": "election_id",
  "title": "Student Council Election",
  "totalVotes": 150,
  "candidates": [
    {
      "_id": "candidate_id",
      "name": "John Doe",
      "voteCount": 75,
      "percentage": "50.00"
    }
  ],
  "status": "active"
}
```

### Voting

#### POST /votes
Cast a vote (requires auth + OTP).

**Body:**
```json
{
  "electionId": "election_id",
  "candidateId": "candidate_id",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Vote cast successfully",
  "verificationHash": "hash_for_verification",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET /votes/history
Get user's voting history (requires auth).

### Admin Endpoints

#### POST /admin/elections
Create new election (requires admin auth).

**Body:**
```json
{
  "title": "New Election",
  "description": "Election description",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z",
  "candidates": [
    {
      "name": "Candidate 1",
      "description": "Candidate description"
    }
  ]
}
```

#### GET /admin/elections
Get all elections with admin details (requires admin auth).

#### PUT /admin/elections/:id
Update election (requires admin auth).

#### DELETE /admin/elections/:id
Delete election (requires admin auth, only if no votes cast).

#### GET /admin/elections/:id/analytics
Get detailed election analytics (requires admin auth).

**Response:**
```json
{
  "electionId": "election_id",
  "title": "Election Title",
  "totalVotes": 100,
  "totalUsers": 500,
  "turnoutPercentage": "20.00",
  "hourlyDistribution": {
    "9": 10,
    "10": 15,
    "11": 20
  },
  "candidateResults": [...]
}
```

#### GET /admin/users
Get all users (requires admin auth).

#### PATCH /admin/users/:id/toggle-status
Toggle user active status (requires admin auth).

## Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Voting endpoints: Additional OTP verification required

## Security Notes

1. All passwords are hashed with bcrypt
2. JWT tokens expire in 15 minutes
3. OTP codes expire in 10 minutes
4. Votes are encrypted and anonymized
5. Rate limiting prevents abuse
6. Input validation on all endpoints