import { getUserIdFromToken } from './getUserIdFromToken';
import { imageModel } from '@models/MongoDB/ImageSchema';
import connect from '@services/mongo-connect';

export async function checkFilterAndFindInDb(event) {
  const connectToMongo = connect();
  const pageNumber = Number(event.queryStringParameters.page);
  const limit = Number(event.queryStringParameters.limit);
  const userIdFromRequest = await getUserIdFromToken(event);
  let result;
  let img;

  if (event.queryStringParameters.filter === 'All') {
    img = await getImageForTotal__ForFilterAll(userIdFromRequest);
    result = await getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit);
  } else {
    img = await getImageForTotal__ForFilterMyImage(userIdFromRequest);
    result = await getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit);
  }
  return { result: result, img: img };
}

async function getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit) {
  const imageFromDb = await imageModel
    .find({
      $or: [{ userId: userIdFromRequest }, { userId: '615aae0509d876c365438bf0' }],
    })
    .lean()
    .skip(Number((pageNumber - 1) * limit))
    .limit(limit);

  return imageFromDb;
}

async function getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit) {
  console.log('userIdFromRequest' + userIdFromRequest);
  const imageFromDb = await imageModel
    .find({ userId: userIdFromRequest })
    .lean()
    .skip(Number((pageNumber - 1) * limit))
    .limit(limit);

  return imageFromDb;
}

async function getImageForTotal__ForFilterAll(userIdFromRequest) {
  const imgForTotal = await imageModel
    .find({
      $or: [{ userId: userIdFromRequest }, { userId: '615aae0509d876c365438bf0' }],
    })
    .lean();

  return imgForTotal;
}

async function getImageForTotal__ForFilterMyImage(userIdFromRequest) {
  const imgForTotal = await imageModel.find({ userId: userIdFromRequest }).lean();

  return imgForTotal;
}
