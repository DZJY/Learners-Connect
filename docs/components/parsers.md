# File Parsing Components

## `extractPdfContent(buffer)`

Uses Google Cloud Document AI to extract text from a PDF.

## `extractDocxContent(buffer)`

Uses `mammoth` to convert .docx to clean HTML.

## `extractVideoContent(buffer, fileName, filepath)`

- Converts audio using FFmpeg
- Uploads to Google Cloud Storage
- Uses Google Speech-to-Text for transcription
