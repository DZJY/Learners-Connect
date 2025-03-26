
---

## 📂 `docs/api/friends.md`

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

{
  "message": "Friend added",
  "friends": ["friend@example.com"]
}
