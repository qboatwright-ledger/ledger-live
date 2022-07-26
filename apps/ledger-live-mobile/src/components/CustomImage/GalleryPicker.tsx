import React, { useCallback, useState } from "react";
import { Button, Flex } from "@ledgerhq/native-ui";
import styled from "styled-components/native";
import { ImageDimensions, ImageFileUri } from "./types";
import { importImageFromPhoneGallery } from "./imageUtils";

type Props = {
  onResult: (res: Partial<ImageDimensions> & ImageFileUri) => void;
};

const Image = styled.Image.attrs({
  resizeMode: "contain",
})`
  margin-left: 10px;
  height: 30px;
  width: 30px;
`;

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
        <Image source={{ uri: res?.imageFileUri }} resizeMode="contain" />
      ) : null}
    </Flex>
  );
};

export default GalleryPicker;
