import React, { useCallback, useRef } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import { CropView } from "react-native-image-crop-tools";
import { Platform, StyleProp, View } from "react-native";
import { loadImageBase64FromURI } from "./imageUtils";
import { ImageBase64Data, ImageDimensions, ImageFileUri } from "./types";

export type CropResult = ImageDimensions & ImageBase64Data & ImageFileUri;

export type Props = ImageFileUri & {
  /**
   * - on Android, this must be a fileURI
   * - on iOS, this can be a URL directly
   */
  // NB, on
  aspectRatio: { width: number; height: number };
  onResult: (res: CropResult) => void;
  style?: StyleProp<View>;
};

const ImageCropper: React.FC<Props> = props => {
  const { style, imageFileUri, aspectRatio, onResult } = props;

  const cropViewRef = useRef<CropView>(null);

  const handleImageCrop = useCallback(
    async res => {
      const { height, width, uri: fileUri } = res;
      try {
        const base64 = await loadImageBase64FromURI(
          Platform.OS === "android" ? `file://${fileUri}` : fileUri,
        );
        onResult({
          width,
          height,
          imageBase64DataUri: base64,
          imageFileUri: fileUri,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [onResult],
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
        ref={cropViewRef}
        onImageCrop={handleImageCrop}
        keepAspectRatio
        aspectRatio={aspectRatio}
      />
      <Button type="main" onPress={handleSave}>
        Crop
      </Button>
    </Flex>
  );
};

export default ImageCropper;
