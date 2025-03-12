import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bookmarks: { type: [Schema.Types.ObjectId], default: [], ref: 'Bookmark' },
    friends: { type: [String], default: [] },
    points: { type: Number, default: 100 },
    NotesOwned: { type: [String], default: [] },
    forumPosts: { type: [Schema.Types.ObjectId], default: [], ref: 'ForumPost' }, // Can remove if not frequently queried
  },
  { timestamps: true }
);

const ReplySchema = new Schema(
  {
    commenterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const CommentSchema = new Schema(
  {
    commenterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    name: { type: String, required: true },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ForumPostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* Create models */
const Users = models.User || model('User', UserSchema);
const ForumPost = models.ForumPost || model('ForumPost', ForumPostSchema);

export { Users, ForumPost };
