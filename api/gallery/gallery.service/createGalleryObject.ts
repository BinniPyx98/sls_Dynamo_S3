export async function createGalleryObject(event, dbResult) {
  const pageNumber = Number(event.queryStringParameters.page);
  const limit = Number(event.queryStringParameters.limit);
  const imagePathArray: Array<string> = []; //img path array
  try {
    const total = Math.ceil(Number(dbResult.img.length) / limit);

    for (const file of dbResult.result) {
      // @ts-ignore
      imagePathArray.push(String(file.path));
    }

    const galleryObj = {
      total: total,
      page: Number(pageNumber),
      objects: imagePathArray,
    };

    return galleryObj;
  } catch (err) {
    console.log(err);
  }
}
