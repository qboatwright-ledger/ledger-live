import { createCustomErrorClass } from "@ledgerhq/errors";

export const ImageLoadFromGalleryError = createCustomErrorClass(
  "ImageLoadFromGalleryError",
);

export const ImageDownloadError = createCustomErrorClass("ImageDownloadError");

export const ImageTooLargeError = createCustomErrorClass("ImageTooLargeError");

export const ImageMetadataLoadingError = createCustomErrorClass(
  "ImageMetadataLoadingError",
);
