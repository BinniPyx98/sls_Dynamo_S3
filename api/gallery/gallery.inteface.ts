/**
 * This file should contain all required interfaces for the feature
 */

export interface GalleryObject {
  total: number;
  page: number;
  objects: Array<string>;
}
export interface GetGalleryObject {
  input: {
    total: number;
    page: number;
    objects: Array<string>;
  };
}
