import React, { useCallback, useState } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import { launchImageLibrary } from "react-native-image-picker";
import { Alert, Image } from "react-native";
import { ImageDimensions, ImageDimensionsMaybe, ImageFileUri } from "./types";

type Props = {
  onResult: (res: ImageDimensionsMaybe & ImageFileUri) => void;
};

type Res = {
  base64: string;
  uri?: string;
  width?: number;
  height?: number;
  type?: string;
  filename?: string;
};

const GalleryPicker: React.FC<Props> = props => {
  const [res, setRes] = useState<Res | null>(null);
  const { onResult } = props;

  const handlePressGallery = useCallback(async () => {
    const {
      assets,
      didCancel,
      errorCode,
      errorMessage,
    } = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
      includeBase64: true,
    });
    if (didCancel) {
      Alert.alert("did cancel");
    } else if (errorCode) {
      console.error("error", errorCode, errorMessage);
    } else {
      const asset = assets && assets[0];
      if (!asset) {
        console.error("asset undefined");
        return;
      }
      const { base64, uri, width, height, type, fileName } = asset;
      const fullBase64 = `data:${type};base64, ${base64}`;
      setRes({ base64: fullBase64, uri, width, height, fileName, type });
      if (uri) {
        onResult({ width, height, imageFileUri: uri });
      } else {
        console.error("no uri returned from GalleryPicker");
      }
    }
  }, [setRes, onResult]);

  return (
    <Flex flexDirection="row" alignItems="center">
      <Button flex={1} onPress={handlePressGallery} type="main">
        Pick from gallery
      </Button>
      {res?.uri ? (
        <Image
          source={{ uri: res?.uri }}
          style={{
            marginLeft: 10,
            height: 30,
            width: 30,
          }}
          resizeMode="contain"
        />
      ) : null}
    </Flex>
  );
};

export default GalleryPicker;
