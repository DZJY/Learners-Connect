
---

## 📂 `docs/api/points.md`

```markdown
# Points API

Manages user points for purchases and rewards.

## **GET** `/api/points?email=<userEmail>`

Fetches the user's current point balance.

---

## **POST** `/api/points`

Adds points to a user's balance.

### Body

```json
{
  "email": "user@example.com",
  "amount": 10
}
