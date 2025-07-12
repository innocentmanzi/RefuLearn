# Assessment Submission Guide

## Overview

This guide documents the new assessment submission structure and endpoints for the RefuLearn platform. The new structure provides a more streamlined and efficient way to handle user assessment submissions.

## New Assessment Submission Schema

### Request Structure

```json
{
  "user": 0,
  "assessment": 0,
  "attempt_number": 1,
  "answers": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "score": 0,
  "passed": true,
  "completed_at": "2025-07-03T21:16:03.034Z",
  "time_taken": 0
}
```

### Field Descriptions

- **user**: User ID (number or string)
- **assessment**: Assessment ID (number)
- **attempt_number**: Attempt number for this assessment (number, starting from 1)
- **answers**: Array of question-answer pairs
  - **question**: The question text (string)
  - **answer**: The user's answer (string)
- **score**: Calculated score for the assessment (number)
- **passed**: Whether the user passed the assessment (boolean)
- **completed_at**: ISO timestamp when the assessment was completed (string)
- **time_taken**: Time taken to complete the assessment in seconds (number)

## API Endpoints

### 1. Create Assessment Submission

**POST** `/api/assessments/user-submissions`

Creates a new assessment submission.

#### Request Body
```json
{
  "assessment": 1,
  "attempt_number": 1,
  "answers": [
    {
      "question": "What is the capital of France?",
      "answer": "Paris"
    },
    {
      "question": "What is 2 + 2?",
      "answer": "4"
    }
  ],
  "time_taken": 300
}
```

#### Response
```json
{
  "success": true,
  "message": "Assessment submission created successfully",
  "data": {
    "submission": {
      "_id": "1751496410498",
      "_rev": "1-abc123",
      "type": "user_assessment_submission",
      "user": 123,
      "assessment": 1,
      "attempt_number": 1,
      "answers": [...],
      "score": 85,
      "passed": true,
      "completed_at": "2025-07-03T21:16:03.034Z",
      "time_taken": 300,
      "createdAt": "2025-07-03T21:16:03.034Z",
      "updatedAt": "2025-07-03T21:16:03.034Z"
    }
  }
}
```

### 2. Get Assessment Submissions

**GET** `/api/assessments/user-submissions`

Retrieves assessment submissions with optional filtering and pagination.

#### Query Parameters
- `assessment` (optional): Filter by assessment ID
- `user` (optional): Filter by user ID (admin/instructor only)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

#### Response
```json
{
  "success": true,
  "data": {
    "submissions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSubmissions": 50
    }
  }
}
```

### 3. Get Assessment Submission by ID

**GET** `/api/assessments/user-submissions/:submissionId`

Retrieves a specific assessment submission.

#### Response
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "1751496410498",
      "type": "user_assessment_submission",
      "user": 123,
      "assessment": 1,
      "attempt_number": 1,
      "answers": [...],
      "score": 85,
      "passed": true,
      "completed_at": "2025-07-03T21:16:03.034Z",
      "time_taken": 300
    }
  }
}
```

### 4. Update Assessment Submission

**PUT** `/api/assessments/user-submissions/:submissionId`

Updates an existing assessment submission.

#### Request Body
```json
{
  "score": 90,
  "passed": true,
  "answers": [
    {
      "question": "What is the capital of France?",
      "answer": "Paris"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "message": "Assessment submission updated successfully",
  "data": {
    "submission": {
      "_id": "1751496410498",
      "score": 90,
      "passed": true,
      "updatedAt": "2025-07-03T21:20:00.000Z"
    }
  }
}
```

### 5. Delete Assessment Submission

**DELETE** `/api/assessments/user-submissions/:submissionId`

Deletes an assessment submission.

#### Response
```json
{
  "success": true,
  "message": "Assessment submission deleted successfully"
}
```

## Authentication & Authorization

All endpoints require authentication via Bearer token. Authorization rules:

- **Regular users**: Can only access their own submissions
- **Instructors/Admins**: Can access all submissions and filter by user

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "assessment",
      "message": "Assessment ID must be a positive integer"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to view this submission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Assessment submission not found"
}
```

## Scoring Logic

The system automatically calculates scores based on:

1. **Multiple Choice Questions**: Exact match with correct answer
2. **Points System**: Each question has assigned points
3. **Pass/Fail**: Determined by percentage score against passing threshold (default: 70%)

## Testing

Use the provided test script to verify endpoints:

```bash
cd backend
node test-assessment-endpoints.js
```

**Note**: Update the `TEST_TOKEN` variable in the test script with a valid authentication token.

## Migration from Old Structure

The old assessment submission structure:
```json
{
  "course": "string",
  "assessment": "string",
  "answers": [{}],
  "score": 0,
  "feedback": "string",
  "graded": true,
  "submittedAt": "2025-07-03T21:15:49.612Z",
  "gradedAt": "2025-07-03T21:15:49.612Z"
}
```

Has been replaced with the new structure for better:
- **Performance**: Simplified data structure
- **Scalability**: Better indexing and querying
- **User Experience**: Clearer attempt tracking
- **Analytics**: Better data for insights

## Swagger Documentation

The new endpoints are documented in the Swagger UI at:
`http://localhost:5000/`

Navigate to the "assessments" section to see the complete API documentation. 