import { Dimensions } from "react-native";

export const boxToFitDimensions = {
  width: Dimensions.get("screen").width,
  height: Dimensions.get("screen").height,
};

export const cropAspectRatio = {
  width: 1080,
  height: 1400,
};
