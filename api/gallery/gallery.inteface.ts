/**
 * This file should contain all required interfaces for the feature
 */

export interface MediaInfoUrl {
  url: string;
}

export interface test {
  total: number;
  page: number;
  objects: Array<string>;
}
export interface getGalleryInterface {
  input: {
    total: number;
    page: number;
    objects: Array<string>;
  };
}
