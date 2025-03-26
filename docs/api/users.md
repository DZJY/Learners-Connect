# Users API

Handles fetching user details such as notes they’ve uploaded and bought.

## **GET** `/api/user/notes?email=<userEmail>`

Fetches uploaded and purchased notes for the user.

### Query Parameters

| Parameter | Type   | Description       |
|-----------|--------|-------------------|
| `email`   | String | Email of the user |

### Response

```json
{
  "uploadedNotes": [...],
  "boughtNotes": [...]
}
