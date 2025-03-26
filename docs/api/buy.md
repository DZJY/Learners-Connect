
---

## 📂 `docs/api/buy.md`

```markdown
# Buy Notes API

Handles note purchases between users.

## **PATCH** `/api/buy?buyerEmail=<buyer>&sellerEmail=<seller>&noteId=<noteId>&amount=<points>`

Performs the purchase transaction:
- Deducts points from the buyer
- Credits points to the seller
- Adds the note to the buyer’s `NotesOwned`

### Query Parameters

| Parameter     | Type   | Description                  |
|---------------|--------|------------------------------|
| `buyerEmail`  | String | Email of buyer               |
| `sellerEmail` | String | Email of seller              |
| `noteId`      | String | ObjectId of the note         |
| `amount`      | Number | Points used for the purchase |

### Response

```json
{
  "message": "Transaction successful",
  "noteTitle": "lecture.pdf",
  "buyerPoints": 20,
  "sellerPoints": 50
}
