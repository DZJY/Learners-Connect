import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true }, // Ensure name is required
    email: { type: String, required: true, unique: true }, // Unique email
    password: { type: String, required: true }, // Hashed password
    bookmarks: { type: [Schema.Types.ObjectId], default: [], ref: 'Bookmark' }, // References another collection
    friends: { type: [String], default: [] }, // Default empty array
    points: { type: Number, default: 100 }, // Default 100 points
    NotesOwned: { type: [String], default: [] },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

/* Create a Mongoose model for the "User" collection */
const Users = models.User || model('User', UserSchema);

export default Users;
