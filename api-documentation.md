# Backend API Documentation

## Overview
All backend APIs have been successfully created and are using a shared mock database for data consistency.

## API Endpoints

### 1. Job Applications API

#### GET /api/applications
- **Description**: Get all job applications for a user
- **Query Parameters**:
  - `status`: Filter by status (comma-separated)
  - `company`: Filter by company name
  - `search`: Search in job title or company
- **Response**: List of applications with filtering

#### POST /api/applications
- **Description**: Create a new job application
- **Required Fields**: `jobTitle`, `company`, `location`, `clearanceRequired`
- **Response**: Created application object

#### GET /api/applications/[id]
- **Description**: Get specific application details
- **Response**: Single application with full details

#### PUT /api/applications/[id]
- **Description**: Update application status or details
- **Response**: Updated application

#### DELETE /api/applications/[id]
- **Description**: Delete an application
- **Response**: Deleted application confirmation

#### GET /api/applications/stats
- **Description**: Get application statistics
- **Query Parameters**:
  - `range`: Time range (30d, 90d, 1y, all)
- **Response**: Statistics including response rate, interview rate, status breakdown

#### POST /api/applications/[id]/interviews
- **Description**: Schedule an interview for an application
- **Required Fields**: `type`, `date`, `time`
- **Response**: Created interview object

### 2. User Profile API

#### GET /api/profile
- **Description**: Get user profile
- **Query Parameters**:
  - `userId`: User ID (defaults to 1)
- **Response**: User profile with privacy settings applied

#### PUT /api/profile
- **Description**: Update user profile
- **Body**: Profile fields to update
- **Response**: Updated profile

#### POST /api/profile
- **Description**: Create new user profile
- **Required Fields**: `email`, `name`, `clearanceLevel`
- **Response**: Created profile

### 3. Certifications API

#### GET /api/certifications
- **Description**: Get user certifications
- **Query Parameters**:
  - `userId`: User ID
  - `category`: Filter by category
  - `status`: Filter by status (active, expired, expiring_soon)
- **Response**: List of certifications with statistics

#### POST /api/certifications
- **Description**: Add new certification
- **Required Fields**: `name`, `issuer`, `issueDate`, `category`
- **Response**: Created certification

#### DELETE /api/certifications
- **Description**: Delete certifications
- **Query Parameters**:
  - `ids`: Comma-separated certification IDs
  - `userId`: User ID
- **Response**: Deletion confirmation

### 4. Dashboard Analytics API

#### GET /api/dashboard/analytics
- **Description**: Get comprehensive dashboard analytics
- **Query Parameters**:
  - `userId`: User ID
  - `period`: Time period (7d, 30d, 90d, 1y)
- **Response**: Complete analytics data including:
  - User stats
  - Application metrics
  - Certification summary
  - Goals progress
  - Activity timeline
  - Trends

#### POST /api/dashboard/analytics
- **Description**: Update user goals
- **Body**: `goals` object with targets
- **Response**: Updated goals

### 5. Job Matching API

#### POST /api/jobs/match
- **Description**: Find matching jobs based on user profile
- **Body**:
  - `skills`: Array of user skills
  - `clearanceLevel`: User's clearance level
  - `location`: Preferred location
  - `yearsExperience`: Years of experience
  - `minMatch`: Minimum match percentage (default: 50)
  - `limit`: Result limit (default: 10)
- **Response**: Ranked job matches with match percentage and reasons

#### GET /api/jobs/match
- **Description**: Get saved job matches
- **Query Parameters**:
  - `userId`: User ID
- **Response**: List of saved matches

## Data Models

### JobApplication
```typescript
{
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  salary?: string
  clearanceRequired: string
  dateApplied: string
  status: ApplicationStatus
  notes?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  resumeVersion?: string
  coverLetter?: boolean
  referral?: string
  interviews: Interview[]
  documents: Document[]
  timeline: TimelineEvent[]
  tags: string[]
  isFavorite?: boolean
  lastUpdated: string
}
```

### UserProfile
```typescript
{
  id: string
  email: string
  name: string
  clearanceLevel: string
  skills: string[]
  preferences: {
    jobAlerts: boolean
    emailNotifications: boolean
    locations: string[]
    clearanceLevels: string[]
    remoteWork: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'cleared-only'
    showEmail: boolean
    showPhone: boolean
    allowRecruiterContact: boolean
  }
}
```

### Certification
```typescript
{
  id: string
  userId: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  category: 'security' | 'cloud' | 'network' | 'development' | 'infrastructure' | 'other'
  status: 'active' | 'expired' | 'expiring_soon'
  verificationStatus: 'verified' | 'pending' | 'unverified'
}
```

## Mock Data
All APIs use a shared mock database located at `/lib/mock-db.ts`. This ensures data consistency across all endpoints.

## Error Handling
All APIs follow consistent error handling:
- 200: Success
- 201: Created
- 400: Bad Request (missing fields, invalid data)
- 404: Not Found
- 409: Conflict (duplicate data)
- 500: Internal Server Error

## Next Steps
1. Replace mock database with actual database (PostgreSQL/MongoDB)
2. Add authentication middleware
3. Implement real-time updates with WebSockets
4. Add rate limiting
5. Add data validation with Zod or Joi
6. Implement caching for performance