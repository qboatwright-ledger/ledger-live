import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Flex, Icons, InfiniteLoader } from "@ledgerhq/native-ui";
import { CropView } from "react-native-image-crop-tools";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { useTranslation } from "react-i18next";
import ImageCropper, {
  Props as ImageCropperProps,
  CropResult,
} from "../../components/CustomImage/ImageCropper";
import {
  ImageDimensions,
  ImageFileUri,
  ImageURL,
} from "../../components/CustomImage/types";
import {
  downloadImageToFile,
  fitImageContain,
  loadImageSizeAsync,
} from "../../components/CustomImage/imageUtils";
import { boxToFitDimensions, cropAspectRatio } from "./shared";
import Button from "../../components/Button";
import { navigationRef } from "../../rootnavigation";
import { ScreenName } from "../../const";

const Container = styled(SafeAreaView)`
  flex: 1;
`;

type RouteParams = Partial<ImageURL> &
  Partial<ImageFileUri> &
  Partial<ImageDimensions>;

const CustomImageCroppingScreen: React.FC<{}> = () => {
  const cropperRef = useRef<CropView>(null);
  const [imageToCrop, setImageToCrop] = useState<
    (ImageFileUri & Partial<ImageDimensions>) | null
  >(null);

  const { t } = useTranslation();

  const navigation = useNavigation();
  const { params }: { params: RouteParams } = useRoute();

  /** LOAD SOURCE IMAGE FROM PARAMS */
  useEffect(() => {
    if (params?.imageUrl) {
      const { imageUrl } = params;
      const loadImage = async () => {
        const [dims, uri] = await Promise.all([
          loadImageSizeAsync(imageUrl),
          downloadImageToFile(imageUrl),
        ]);
        setImageToCrop({
          width: dims.width,
          height: dims.height,
          imageFileUri: uri,
        });
      };
      loadImage();
    } else if (params?.imageFileUri) {
      setImageToCrop({
        imageFileUri: params?.imageFileUri,
        height: params?.height,
        width: params?.width,
      });
    }
  }, [params]);

  /** CROP IMAGE HANDLING */

  const handleCropResult: ImageCropperProps["onResult"] = useCallback(
    (res: CropResult) => {
      navigation.navigate(ScreenName.CustomImagePreviewScreen, res);
    },
    [navigation],
  );

  const handlePressNext = useCallback(() => {
    cropperRef?.current?.saveImage(undefined, 100);
  }, [cropperRef]);

  const handlePressRotateLeft = useCallback(() => {
    cropperRef?.current?.rotateImage(false);
  }, [cropperRef]);

  const handlePressRotateRight = useCallback(() => {
    cropperRef?.current?.rotateImage(true);
  }, [cropperRef]);

  const sourceDimensions = useMemo(
    () =>
      fitImageContain(
        {
          height: imageToCrop?.height ?? 200,
          width: imageToCrop?.width ?? 200,
        },
        boxToFitDimensions,
      ),
    [imageToCrop?.height, imageToCrop?.width],
  );

  return (
    <Container>
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Flex flex={1} justifyContent="center" alignItems="center">
          {imageToCrop ? (
            <ImageCropper
              ref={cropperRef}
              imageFileUri={imageToCrop.imageFileUri}
              aspectRatio={cropAspectRatio}
              style={sourceDimensions}
              onResult={handleCropResult}
            />
          ) : (
            <InfiniteLoader />
          )}
        </Flex>
        {imageToCrop ? (
          <>
            <Flex flexDirection="row" p={5}>
              <Button
                mr={5}
                type="main"
                Icon={Icons.ChevronLeftMedium}
                onPress={handlePressRotateLeft}
              />
              <Button
                mr={5}
                type="main"
                Icon={Icons.ChevronRightMedium}
                onPress={handlePressRotateRight}
              />
              <Button
                flex={1}
                type="main"
                onPress={handlePressNext}
                outline={false}
              >
                {t("common.next")}
              </Button>
            </Flex>
          </>
        ) : null}
      </Flex>
    </Container>
  );
};

export default CustomImageCroppingScreen;
