# Storage Architecture

## GridFS (MongoDB)

- Files are stored in `fs.files` and `fs.chunks`
- Metadata includes: `title`, `description`, `userEmail`, `userName`, `filepath`

## `summaries` Collection

Stores:
- `fileId`
- `summary`
- `qna`

## `users` Collection

Adds the uploaded file’s `_id` to the user’s `NotesOwned` field.
