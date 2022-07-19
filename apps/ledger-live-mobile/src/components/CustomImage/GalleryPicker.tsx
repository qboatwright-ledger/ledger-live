import React, { useCallback, useState } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import { launchImageLibrary } from "react-native-image-picker";
import { Alert, Image } from "react-native";
import { ImageDimensions, ImageDimensionsMaybe, ImageFileUri } from "./types";
import { importImageFromPhoneGallery } from "./imageUtils";

type Props = {
  onResult: (res: Partial<ImageDimensions> & ImageFileUri) => void;
};

const GalleryPicker: React.FC<Props> = props => {
  const [res, setRes] = useState<
    (Partial<ImageDimensions> & ImageFileUri) | null
  >(null);
  const { onResult } = props;

  const handlePressGallery = useCallback(async () => {
    const res = await importImageFromPhoneGallery();
    if (res) {
      setRes(res);
      onResult(res);
    }
  }, [setRes, onResult]);

  return (
    <Flex flexDirection="row" alignItems="center">
      <Button flex={1} onPress={handlePressGallery} type="main">
        Pick from gallery
      </Button>
      {res?.imageFileUri ? (
        <Image
          source={{ uri: res?.imageFileUri }}
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
