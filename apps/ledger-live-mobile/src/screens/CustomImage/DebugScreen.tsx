import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Button, Flex, Text } from "@ledgerhq/native-ui";
import styled from "styled-components/native";
import GalleryPicker from "../../components/CustomImage/GalleryPicker";
import ImageCropper, {
  CropResult,
  Props as ImageCropperProps,
} from "../../components/CustomImage/ImageCropper";
import ImageResizer, {
  Props as ImageResizeProps,
  ResizeResult,
} from "../../components/CustomImage/ImageResizer";
import ImageProcessor, {
  ProcessorPreviewResult,
  ProcessorRawResult,
  Props as ImageProcessorProps,
} from "../../components/CustomImage/ImageProcessor";
import {
  downloadImageToFile,
  fitImageContain,
  loadImageSizeAsync,
} from "../../components/CustomImage/imageUtils";
import {
  ImageDimensions,
  ImageDimensionsMaybe,
  ImageFileUri,
  ImageUrl,
} from "../../components/CustomImage/types";
import { cropAspectRatio } from "./shared";

type RouteParams = Partial<ImageUrl>;

const PreviewImage = styled(Image).attrs({
  resizeMode: "contain",
})`
  width: 200px;
  height: 200px;
`;

const boxToFitDimensions = {
  height: Dimensions.get("screen").height,
  width: Dimensions.get("screen").width,
};

type ImageToCrop = Partial<ImageDimensions> & ImageFileUri;

type ProcessorRawResult = ImageDimensions & {
  hexData: string;
};

export default function DebugScreen() {
  const imageProcessorRef = useRef<ImageProcessor>(null);
  const [imageToCrop, setImageToCrop] = useState<ImageToCrop | null>(null);
  const [croppedImage, setCroppedImage] = useState<CropResult | null>(null);
  const [resizedImage, setResizedImage] = useState<ResizeResult | null>(null);
  const [
    processorPreviewImage,
    setProcessorPreviewImage,
  ] = useState<ProcessorPreviewResult | null>(null);
  const [
    processorRawResult,
    setProcessorRawResult,
  ] = useState<ProcessorRawResult | null>(null);

  const { params = {} }: { params?: RouteParams } = useRoute();

  const { imageUrl: paramsImageURL } = params;

  /** SOURCE IMAGE HANDLING */

  useEffect(() => {
    if (paramsImageURL) {
      const loadImage = async () => {
        const [dims, { imageFileUri }] = await Promise.all([
          loadImageSizeAsync(paramsImageURL),
          downloadImageToFile({ imageUrl: paramsImageURL }),
        ]);
        setImageToCrop({
          width: dims.width,
          height: dims.height,
          imageFileUri,
        });
      };
      loadImage();
    }
  }, [paramsImageURL]);

  const handleGalleryPickerResult = useCallback(
    ({ width, height, imageFileUri }) => {
      setImageToCrop({ width, height, imageFileUri });
    },
    [setImageToCrop],
  );

  /** CROP IMAGE HANDLING */

  const handleCropResult: ImageCropperProps["onResult"] = useCallback(
    (res: CropResult) => {
      setCroppedImage(res);
    },
    [setCroppedImage],
  );

  /** RESIZED IMAGE HANDLING */

  const handleResizeResult: ImageResizeProps["onResult"] = useCallback(
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
    data => {
      setProcessorRawResult(data);
    },
    [setProcessorRawResult],
  );

  const requestRawResult = useCallback(() => {
    imageProcessorRef?.current?.requestRawResult();
  }, [imageProcessorRef]);

  const [contrast, setContrast] = useState(1);

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
    <ScrollView>
      <Flex p="10px">
        {!paramsImageURL && (
          <GalleryPicker onResult={handleGalleryPickerResult} />
        )}
        {imageToCrop?.imageFileUri ? (
          <Flex mt={5}>
            <Text mt={5} variant="h3">
              Source image:
            </Text>
            <PreviewImage
              source={{ uri: imageToCrop.imageFileUri }}
              style={{ ...sourceDimensions }}
            />
            <Flex height={5} />
            <Text mt={5} variant="h3">
              Cropping: (ratio: H{cropAspectRatio.height}, W
              {cropAspectRatio.width})
            </Text>
            <ImageCropper
              imageFileUri={imageToCrop.imageFileUri}
              aspectRatio={cropAspectRatio}
              style={{ alignSelf: "center", ...sourceDimensions }}
              withButton
              onResult={handleCropResult}
            />
          </Flex>
        ) : null}
        {croppedImage && (
          <ImageResizer
            targetDimensions={cropAspectRatio}
            imageFileUri={croppedImage?.imageFileUri}
            onResult={handleResizeResult}
          />
        )}
        {resizedImage?.imageBase64DataUri && (
          <>
            <Text mt={5} variant="h3">
              Image processing:
            </Text>
            <ImageProcessor
              debug
              ref={imageProcessorRef}
              imageBase64DataUri={resizedImage?.imageBase64DataUri}
              onPreviewResult={handlePreviewResult}
              onRawResult={handleRawResult}
              contrast={contrast}
            />
            <Flex flexDirection="row" pt={3}>
              {[1, 2, 5, 8].map((val, index) => (
                <Button
                  key={index}
                  onPress={() => setContrast(val)}
                  type="color"
                >
                  {index + 1}
                </Button>
              ))}
            </Flex>
          </>
        )}
        {processorPreviewImage?.imageBase64DataUri && (
          <Flex>
            <Text mt={5} variant="h3">
              result:
            </Text>
            <Text>width: {processorPreviewImage?.width}</Text>
            <Text>height: {processorPreviewImage?.height}</Text>
            <PreviewImage
              source={{ uri: processorPreviewImage.imageBase64DataUri }}
              style={{
                height: previewDimensions?.height,
                width: previewDimensions?.width,
              }}
            />
            <Button type="main" onPress={requestRawResult}>
              Request & display (shortened) hex data
            </Button>
            {processorRawResult?.hexData && (
              <>
                <Text>Raw result:</Text>
                <Text>width: {processorRawResult?.width}</Text>
                <Text>height: {processorRawResult?.height}</Text>
                <Text>{processorRawResult?.hexData.slice(0, 2000)}</Text>
              </>
            )}
          </Flex>
        )}
      </Flex>
    </ScrollView>
  );
}
