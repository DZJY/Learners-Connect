
---

## 📂 `docs/api/friends.md`

```markdown
# Friends API

Handles adding, removing, and fetching friends for a user.

## **GET** `/api/friends?email=<userEmail>`

Fetches the user's friends list.

---

## **POST** `/api/friends?email=<userEmail>&friendEmail=<friendEmail>`

Adds a new friend.

---

## **DELETE** `/api/friends?email=<userEmail>&friendEmail=<friendEmail>`

Removes a friend.

### Response

```json
{
  "message": "Friend added",
  "friends": ["friend@example.com"]
}
