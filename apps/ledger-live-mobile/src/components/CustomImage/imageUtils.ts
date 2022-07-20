import { Alert, Image } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { launchImageLibrary } from "react-native-image-picker";
import { ImageDimensions, ImageFileUri, ImageUrl } from "./types";

export async function importImageFromPhoneGallery(): Promise<
  (ImageFileUri & Partial<ImageDimensions>) | undefined
> {
  const {
    assets,
    didCancel,
    errorCode,
    errorMessage,
  } = await launchImageLibrary({
    mediaType: "photo",
    quality: 1,
    includeBase64: false,
  });
  if (didCancel) return;
  if (errorCode) {
    throw new Error(
      `Import from gallery error: ${[errorCode]}: ${errorMessage}`,
    );
  } else {
    const asset = assets && assets[0];
    if (!asset) {
      throw new Error(`Import from gallery error: asset undefined`);
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

type Options = {
  encoding: EncodingType.UTF8 | EncodingType.Base64;
};

export async function downloadImageToFile({
  imageUrl,
}: ImageUrl): Promise<ImageFileUri> {
  const res = await RNFetchBlob.config({ fileCache: true }).fetch(
    "GET",
    imageUrl,
  );
  return { imageFileUri: "file://" + res.path() };
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
        reject(error);
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
