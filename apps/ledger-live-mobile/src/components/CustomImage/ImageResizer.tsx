import { useEffect } from "react";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { ImageBase64Data, ImageDimensions, ImageFileUri } from "./types";

export type ResizeResult = ImageBase64Data & ImageDimensions;

export type Props = ImageFileUri & {
  targetDimensions: ImageDimensions;
  onResult: (res: ResizeResult) => void;
};

const ImageResizer: React.FC<Props> = props => {
  const { imageFileUri, targetDimensions, onResult } = props;

  useEffect(() => {
    manipulateAsync(
      imageFileUri, // TODO: handle undefined imageFileUri
      [
        {
          resize: {
            width: targetDimensions.width,
            height: targetDimensions.height,
          },
        },
      ],
      { base64: true, compress: 1, format: SaveFormat.PNG },
    ).then(({ base64, height, width }) => {
      const fullBase64 = `data:image/png;base64, ${base64}`;
      onResult({ imageBase64DataUri: fullBase64, height, width });
    });
  }, [
    imageFileUri,
    targetDimensions?.height,
    targetDimensions?.width,
    onResult,
  ]);

  return null;
};

export default ImageResizer;
