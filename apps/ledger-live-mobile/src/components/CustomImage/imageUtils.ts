import { Image } from "react-native";
import RNFetchBlob, { FetchBlobResponse, StatefulPromise } from "rn-fetch-blob";
import { launchImageLibrary } from "react-native-image-picker";
import { ImageDimensions, ImageFileUri, ImageUrl } from "./types";
import {
  ImageDownloadError,
  ImageLoadFromGalleryError,
  ImageMetadataLoadingError,
  ImageTooLargeError,
} from "./errors";

export async function importImageFromPhoneGallery(): Promise<
  (ImageFileUri & Partial<ImageDimensions>) | undefined
> {
  try {
    const {
      assets,
      didCancel,
      errorCode,
      // errorMessage,
    } = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
      includeBase64: false,
    });
    if (didCancel) return;
    if (errorCode) {
      throw new ImageLoadFromGalleryError();
    } else {
      const asset = assets && assets[0];
      if (!asset) {
        throw new ImageLoadFromGalleryError();
      }
      const { uri, width, height } = asset;
      if (uri) {
        return {
          width,
          height,
          imageFileUri: uri,
        };
      }
    }
  } catch (e) {
    throw new ImageLoadFromGalleryError();
  }
}

export async function fetchImageBase64(imageUrl: string) {
  return fetch(imageUrl)
    .then(response => response.blob())
    .then(
      data =>
        new Promise<string | undefined>((resolve, reject) => {
          const reader = new FileReader(); // eslint-disable-line no-undef
          reader.onloadend = () => resolve(reader.result?.toString());
          reader.onerror = reject;
          reader.readAsDataURL(data);
        }),
    );
}

export function downloadImageToFileWithCancellable({
  imageUrl,
}: ImageUrl): [Promise<ImageFileUri>, StatefulPromise<FetchBlobResponse>] {
  const downloadTask = RNFetchBlob.config({ fileCache: true }).fetch(
    "GET",
    imageUrl,
  );
  return [
    downloadTask
      .then(res => ({ imageFileUri: "file://" + res.path() }))
      .catch(() => {
        throw new ImageDownloadError();
      }),
    downloadTask,
  ];
}

export async function downloadImageToFile({
  imageUrl,
}: ImageUrl): Promise<ImageFileUri> {
  return downloadImageToFileWithCancellable({ imageUrl })[0];
}

export async function loadImageToFileWithDimensions(
  source: Partial<ImageUrl> & Partial<ImageFileUri> & Partial<ImageDimensions>,
): Promise<ImageFileUri & Partial<ImageDimensions>> {
  if (source?.imageFileUri) {
    return {
      imageFileUri: source?.imageFileUri,
      height: source?.height,
      width: source?.width,
    };
  }
  if (source?.imageUrl) {
    const { imageUrl } = source;
    const [downloadPromise, downloadTask] = downloadImageToFileWithCancellable({
      imageUrl,
    });
    try {
      const [dims, { imageFileUri }] = await Promise.all([
        loadImageSizeAsync(imageUrl),
        downloadPromise,
      ]);
      return {
        width: dims.width,
        height: dims.height,
        imageFileUri,
      };
    } catch (e) {
      /**
       * in case an error happens in loadImageSizeAsync we have to cancel the
       * download task
       * */
      downloadTask.cancel();
      throw e;
    }
  }
  throw new Error("No source specified"); // this shouldn't happen
}

export async function loadImageSizeAsync(
  url: string,
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      url,
      (width, height) => {
        resolve({ width, height });
      },
      error => {
        console.error(error);
        if (error?.message?.startsWith("Pool hard cap violation? ")) {
          reject(new ImageTooLargeError());
        } else {
          reject(new ImageMetadataLoadingError());
        }
      },
    );
  });
}

export function fitImageContain(
  imageDimensions: ImageDimensions,
  boxDimensions: ImageDimensions,
): { height: number; width: number } {
  const { height: imageHeight, width: imageWidth } = imageDimensions;
  const { height: boxHeight, width: boxWidth } = boxDimensions;
  if (imageHeight < boxHeight && imageWidth < boxWidth)
    return {
      width: imageWidth,
      height: imageHeight,
    };
  if (imageWidth / imageHeight >= boxWidth / boxHeight) {
    // width is the constraint
    return {
      width: boxWidth,
      height: (imageHeight / imageWidth) * boxWidth,
    };
  }
  // height is the constraint
  return {
    width: (imageWidth / imageHeight) * boxHeight,
    height: boxHeight,
  };
}
