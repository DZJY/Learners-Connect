# Upload & Summarize API

**POST** `/api/upload`

Accepts a multipart form containing the file and metadata. Extracts content, summarizes, generates QnA, and stores it.

## Form Fields

| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `file`      | File     | The lecture file (.pdf/.docx/.mp4) |
| `title`     | String   | Title for the file           |
| `description` | String | Description of the content   |
| `userEmail` | String   | Email of the uploading user  |
| `userName`  | String   | User’s name                  |

## Response

{
  "message": "File uploaded and summarized successfully",
  "summary": "..."
}
