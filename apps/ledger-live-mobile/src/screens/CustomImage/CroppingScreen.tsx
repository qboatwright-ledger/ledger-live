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
  ImageURL,
} from "../../components/CustomImage/types";
import {
  downloadImageToFile,
  fitImageContain,
  loadImageSizeAsync,
} from "../../components/CustomImage/imageUtils";
import { cropAspectRatio } from "./shared";
import Button from "../../components/Button";
import { ScreenName } from "../../const";
import BottomContainer from "../../components/CustomImage/BottomButtonsContainer";

type RouteParams = Partial<ImageURL> &
  Partial<ImageFileUri> &
  Partial<ImageDimensions>;

export const boxToFitDimensions = {
  width: Dimensions.get("screen").width,
  height: Dimensions.get("screen").height,
};

const CroppingScreen: React.FC<{}> = () => {
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
    if (cropperRef?.current) {
      cropperRef.current.rotateImage(false);
      setRotated(!rotated);
    }
  }, [cropperRef, rotated, setRotated]);

  const handlePressRotateRight = useCallback(() => {
    if (cropperRef?.current) {
      cropperRef.current.rotateImage(true);
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
            <Flex flexDirection="row">
              {/* <View style={{ transform: [{ scaleX: -1 }] }}>
                <Button
                  ml={5}
                  type="main"
                  Icon={Icons.DelegateMedium}
                  onPress={handlePressRotateLeft}
                />
              </View>
              <Button
                mr={5}
                type="main"
                Icon={Icons.DelegateMedium}
                onPress={handlePressRotateRight}
              /> */}
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

export default CroppingScreen;
