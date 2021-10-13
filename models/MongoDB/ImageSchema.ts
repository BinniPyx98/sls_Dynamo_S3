import * as mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    path: String,
    metadata: Object,
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userModel' }],
  },
  { collection: 'image' }
);

//dont use const for imageModel because will overwrite error
// eslint-disable-next-line no-use-before-define
export let imageModel = mongoose.model('imageModel', ImageSchema);
