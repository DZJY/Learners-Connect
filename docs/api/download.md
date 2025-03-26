
---

### 📂 `docs/api/download.md`

```markdown
# Download Summary API

**POST** `/api/download`

Returns the summarized content in a downloadable `.docx` file.

## Body Parameters

| Field     | Type   | Description         |
|-----------|--------|---------------------|
| `summary` | String | The text to include in the Word document |

## Response

- Triggers download of a `.docx` file named `Summary.docx`
