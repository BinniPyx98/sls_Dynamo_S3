import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
const UsersSchema = new mongoose.Schema(
  {
    _id: Schema.Types.ObjectId,
    email: String,
    password: String,
  },
  { collection: 'users' }
);
//dont use const for  userModel because will overwrite error
// eslint-disable-next-line no-use-before-define
export let userModel = mongoose.model('userModel', UsersSchema);
