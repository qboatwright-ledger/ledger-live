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
import { useTranslation } from "react-i18next";
import { Dimensions, Platform, View } from "react-native";
import ImageCropper, {
  Props as ImageCropperProps,
  CropResult,
} from "../../components/CustomImage/ImageCropper";
import {
  ImageDimensions,
  ImageFileUri,
  ImageUrl,
} from "../../components/CustomImage/types";
import {
  downloadImageToFile,
  fitImageContain,
  loadImageSizeAsync,
  loadImageToFileWithDimensions,
} from "../../components/CustomImage/imageUtils";
import { cropAspectRatio } from "./shared";
import Button from "../../components/Button";
import { ScreenName } from "../../const";
import BottomContainer from "../../components/CustomImage/BottomButtonsContainer";
import Touchable from "../../components/Touchable";

type RouteParams = Partial<ImageUrl> &
  Partial<ImageFileUri> &
  Partial<ImageDimensions>;

export const boxToFitDimensions = {
  width: Dimensions.get("screen").width,
  height: Dimensions.get("screen").height,
};

const Step1Cropping: React.FC<{}> = () => {
  const cropperRef = useRef<CropView>(null);
  const [imageToCrop, setImageToCrop] = useState<
    (ImageFileUri & Partial<ImageDimensions>) | null
  >(null);
  const [rotated, setRotated] = useState(false);

  const { t } = useTranslation();

  const navigation = useNavigation();
  const { params }: { params: RouteParams } = useRoute();

  /** LOAD SOURCE IMAGE FROM PARAMS */
  useEffect(() => {
    loadImageToFileWithDimensions(params)
      .then(res => {
        setImageToCrop(res);
      })
      .catch(error => {
        console.error(error);
        navigation.navigate(ScreenName.CustomImageErrorScreen, { error });
      });
  }, [navigation, params]);

  /** CROP IMAGE HANDLING */

  const handleCropResult: ImageCropperProps["onResult"] = useCallback(
    (res: CropResult) => {
      navigation.navigate(ScreenName.CustomImageStep2Preview, res);
    },
    [navigation],
  );

  const handlePressNext = useCallback(() => {
    cropperRef?.current?.saveImage(undefined, 100);
  }, [cropperRef]);

  const handlePressRotateLeft = useCallback(() => {
    if (cropperRef?.current) {
      cropperRef.current.rotateImage(false);
      setRotated(!rotated);
    }
  }, [cropperRef, rotated, setRotated]);

  const sourceDimensions = useMemo(
    () =>
      fitImageContain(
        {
          height:
            (Platform.OS === "android" && rotated
              ? imageToCrop?.width
              : imageToCrop?.height) ?? 200,
          width:
            (Platform.OS === "android" && rotated
              ? imageToCrop?.height
              : imageToCrop?.width) ?? 200,
        },
        boxToFitDimensions,
      ),
    [imageToCrop?.height, imageToCrop?.width, rotated],
  );

  return (
    <Flex flex={1}>
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
          <BottomContainer>
            <Flex mb={7} alignSelf="center">
              <Touchable onPress={handlePressRotateLeft}>
                <Flex
                  px={7}
                  py={4}
                  borderRadius={100}
                  backgroundColor="neutral.c30"
                >
                  <Icons.ReverseMedium size={24} />
                </Flex>
              </Touchable>
            </Flex>
            <Flex flexDirection="row">
              <Button
                flex={1}
                type="main"
                size="large"
                onPress={handlePressNext}
                outline={false}
              >
                {t("common.next")}
              </Button>
            </Flex>
          </BottomContainer>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default Step1Cropping;
