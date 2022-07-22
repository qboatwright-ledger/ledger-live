import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { CropResult } from "../../components/CustomImage/ImageCropper";
import ImageResizer, {
  Props as ImageResizerProps,
  ResizeResult,
} from "../../components/CustomImage/ImageResizer";
import ImageProcessor, {
  Props as ImageProcessorProps,
  ProcessorPreviewResult,
  ProcessorRawResult,
} from "../../components/CustomImage/ImageProcessor";
import { cropAspectRatio } from "./shared";
import { Button, Flex, InfiniteLoader, Text } from "@ledgerhq/native-ui";
import { fitImageContain } from "../../components/CustomImage/imageUtils";
import {
  Dimensions,
  ImageErrorEventData,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Pressable,
} from "react-native";
import BottomButtonsContainer from "../../components/CustomImage/BottomButtonsContainer";
import ContrastChoice from "../../components/CustomImage/ContrastChoice";
import { ScreenName } from "../../const";
import { ImagePreviewError } from "../../components/CustomImage/errors";

type RouteParams = CropResult;

const PreviewImage = styled.Image.attrs({
  resizeMode: "contain",
})`
  width: 200px;
  height: 200px;
`;

const boxToFitDimensions = {
  height: (Dimensions.get("screen").height * 2) / 3,
  width: (Dimensions.get("screen").width * 2) / 3,
};

const contrasts = [
  { val: 1, color: "neutral.c70" },
  { val: 1.5, color: "neutral.c50" },
  { val: 2, color: "neutral.c40" },
  { val: 3, color: "neutral.c30" },
];

const Step2Preview: React.FC<{}> = () => {
  const imageProcessorRef = useRef<ImageProcessor>(null);
  const [resizedImage, setResizedImage] = useState<ResizeResult | null>(null);
  const [contrast, setContrast] = useState(1);
  const [
    processorPreviewImage,
    setProcessorPreviewImage,
  ] = useState<ProcessorPreviewResult | null>(null);
  const [rawResultLoading, setRawResultLoading] = useState(false);
  const [
    processorRawResult,
    setProcessorRawResult,
  ] = useState<ProcessorRawResult | null>(null);

  const { t } = useTranslation();

  const navigation = useNavigation();
  const { params }: { params?: RouteParams } = useRoute() || {};

  const croppedImage = params;

  const handleError = useCallback(
    (error: Error) => {
      console.error(error);
      navigation.navigate(ScreenName.CustomImageErrorScreen, { error });
    },
    [navigation],
  );

  /** RESIZED IMAGE HANDLING */

  const handleResizeResult: ImageResizerProps["onResult"] = useCallback(
    (res: ResizeResult) => {
      setResizedImage(res);
    },
    [setResizedImage],
  );

  /** RESULT IMAGE HANDLING */

  const handlePreviewResult: ImageProcessorProps["onPreviewResult"] = useCallback(
    data => {
      setProcessorPreviewImage(data);
    },
    [setProcessorPreviewImage],
  );

  const handleRawResult: ImageProcessorProps["onRawResult"] = useCallback(
    (data: ProcessorRawResult) => {
      setProcessorRawResult(data);
      navigation.navigate(ScreenName.CustomImageStep3Transfer, {
        rawData: data,
        previewData: processorPreviewImage,
      });
      setRawResultLoading(false);
    },
    [
      navigation,
      setProcessorRawResult,
      setRawResultLoading,
      processorPreviewImage,
    ],
  );

  const handlePreviewImageError = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<ImageErrorEventData>) => {
      console.error(nativeEvent.error);
      handleError(new ImagePreviewError());
    },
    [handleError],
  );

  const requestRawResult = useCallback(() => {
    imageProcessorRef?.current?.requestRawResult();
    setRawResultLoading(true);
  }, [imageProcessorRef, setRawResultLoading]);

  const previewDimensions = useMemo(
    () =>
      fitImageContain(
        {
          width: processorPreviewImage?.width ?? 200,
          height: processorPreviewImage?.height ?? 200,
        },
        boxToFitDimensions,
      ),
    [processorPreviewImage?.height, processorPreviewImage?.width],
  );

  return (
    <Flex flex={1}>
      {croppedImage && (
        <ImageResizer
          targetDimensions={cropAspectRatio}
          imageFileUri={croppedImage?.imageFileUri}
          onError={handleError}
          onResult={handleResizeResult}
        />
      )}
      {resizedImage?.imageBase64DataUri && (
        <ImageProcessor
          ref={imageProcessorRef}
          imageBase64DataUri={resizedImage?.imageBase64DataUri}
          onPreviewResult={handlePreviewResult}
          onError={handleError}
          onRawResult={handleRawResult}
          contrast={contrast}
        />
      )}
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {processorPreviewImage?.imageBase64DataUri ? (
          <PreviewImage
            onError={handlePreviewImageError}
            fadeDuration={0}
            source={{ uri: processorPreviewImage.imageBase64DataUri }}
            style={{
              height: previewDimensions?.height,
              width: previewDimensions?.width,
            }}
          />
        ) : (
          <InfiniteLoader />
        )}
      </Flex>
      <BottomButtonsContainer>
        <Text fontSize="14px" lineHeight="17px">
          {t("customImage.selectContrast")}
        </Text>
        {resizedImage?.imageBase64DataUri && (
          <Flex flexDirection="row" my={6} justifyContent="space-between">
            {contrasts.map(({ val, color }) => (
              <Pressable key={val} onPress={() => setContrast(val)}>
                <ContrastChoice selected={contrast === val} color={color} />
              </Pressable>
            ))}
          </Flex>
        )}
        <Button
          disabled={!processorPreviewImage?.imageBase64DataUri}
          mt={6}
          size="large"
          type="main"
          outline={false}
          onPress={requestRawResult}
          pending={rawResultLoading}
          displayContentWhenPending
        >
          {t("common.confirm")}
        </Button>
      </BottomButtonsContainer>
    </Flex>
  );
};

export default Step2Preview;
