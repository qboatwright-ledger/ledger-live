import React from "react";
import { Flex, Text } from "@ledgerhq/native-ui";
import { useRoute } from "@react-navigation/native";
import {
  ProcessorPreviewResult,
  ProcessorRawResult,
} from "../../components/CustomImage/ImageProcessor";

type RouteParams = {
  rawData: ProcessorRawResult;
  previewData: ProcessorPreviewResult;
};

const Step3Transfer: React.FC<{}> = () => {
  const { params }: { params?: RouteParams } = useRoute() || {};

  const { rawData, previewData } = params;

  return (
    <Flex>
      {rawData?.hexData && (
        <>
          <Text>Raw data (2000 first characters):</Text>
          <Text>width: {rawData?.width}</Text>
          <Text>height: {rawData?.height}</Text>
          <Text>{rawData?.hexData.slice(0, 2000)}</Text>
        </>
      )}
    </Flex>
  );
};

export default Step3Transfer;
