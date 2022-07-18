import React, { useCallback, useRef } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import { CropView } from "react-native-image-crop-tools";
import { Platform } from "react-native";
import { loadImageBase64FromURI } from "./imageUtils";

type Props = {
  sourceUri: string;
  aspectRatio: { width: number; height: number };
  onResult: (res: {
    width: number;
    height: number;
    base64Image: string;
    fileUri: string;
  }) => void;
  style?: StyleProp<View>;
};

const ImageCropper: React.FC<Props> = props => {
  const { style, sourceUri, aspectRatio, onResult } = props;

  const cropViewRef = useRef<CropView>(null);

  const handleImageCrop = useCallback(
    async res => {
      const { height, width, uri: fileUri } = res;
      try {
        const base64 = await loadImageBase64FromURI(
          Platform.OS === "android" ? `file://${fileUri}` : fileUri,
        );
        onResult({ width, height, base64Image: base64, fileUri });
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
        key={sourceUri}
        sourceUrl={sourceUri}
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
