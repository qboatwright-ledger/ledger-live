import React, { useCallback, useRef } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import { CropView } from "react-native-image-crop-tools";
import { StyleProp, View } from "react-native";
import { ImageBase64Data, ImageDimensions, ImageFileUri } from "./types";
import { ImageCropError } from "./errors";

export type CropResult = ImageDimensions & ImageFileUri;

export type Props = ImageFileUri & {
  aspectRatio: { width: number; height: number };
  onResult: (res: CropResult) => void;
  onError: (res: Error) => void;
  style?: StyleProp<View>;
  withButton?: boolean;
};

const ImageCropper: React.FC<Props> = React.forwardRef((props: Props, ref) => {
  const {
    style,
    imageFileUri,
    aspectRatio,
    onError,
    onResult,
    withButton = false,
  } = props;

  const cropViewRef = useRef<CropView>(null);

  const handleImageCrop = useCallback(
    async res => {
      const { height, width, uri: fileUri } = res;
      if (!fileUri) {
        onError(new ImageCropError());
        return;
      }
      onResult({
        width,
        height,
        imageFileUri: fileUri,
      });
    },
    [onError, onResult],
  );

  const handleSave = useCallback(() => {
    cropViewRef?.current?.saveImage(undefined, 100);
  }, []);

  return (
    <Flex>
      <CropView
        key={imageFileUri}
        sourceUrl={imageFileUri}
        style={style}
        ref={withButton ? cropViewRef : ref}
        onImageCrop={handleImageCrop}
        keepAspectRatio
        aspectRatio={aspectRatio}
      />
      {withButton && (
        <Button type="main" onPress={handleSave}>
          Crop
        </Button>
      )}
    </Flex>
  );
});

export default ImageCropper;
