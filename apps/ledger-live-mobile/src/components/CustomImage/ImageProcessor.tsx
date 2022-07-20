import { Flex } from "@ledgerhq/native-ui";
import React from "react";
import { WebView } from "react-native-webview";
import { injectedCode } from "./injectedCode";
import { InjectedCodeDebugger } from "./InjectedCodeDebugger";
import { ImageBase64Data, ImageDimensions } from "./types";

export type ProcessorPreviewResult = ImageBase64Data & ImageDimensions;

export type ProcessorRawResult = { hexData: string } & ImageDimensions;

export type Props = ImageBase64Data & {
  onPreviewResult: (arg: ProcessorPreviewResult) => void;
  onRawResult: (res: ProcessorRawResult) => void;
  /**
   * number >= 0
   *  - 0:  full black
   *  - 1:  original contrast
   *  - >1: more contrasted than the original
   * */
  contrast: number;
  debug?: boolean;
};

/**
 * using a class component here because we need to access some methods from
 * the parent using a ref
 *  */
export default class ImageProcessor extends React.Component<Props> {
  webViewRef: WebView<{}> | null = null;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.contrast !== this.props.contrast) this.setAndApplyContrast();
    if (prevProps.imageBase64DataUri !== this.props.imageBase64DataUri)
      this.computeResult();
  }

  handleMessage = ({ nativeEvent: { data } }: any) => {
    const { onPreviewResult, onRawResult } = this.props;
    const { type, payload } = JSON.parse(data);
    switch (type) {
      case "LOG":
        console.log("WEBVIEWLOG:", payload);
        break;
      case "BASE64_RESULT":
        onPreviewResult({
          width: payload.width,
          height: payload.height,
          imageBase64DataUri: payload.base64Data,
        });
        break;
      case "RAW_RESULT":
        onRawResult({
          width: payload.width,
          height: payload.height,
          hexData: payload.hexData,
        });
        break;
      default:
        break;
    }
  };

  injectJavaScript = (script: string) => {
    this.webViewRef?.injectJavaScript(script);
  };

  processImage = () => {
    const { imageBase64DataUri } = this.props;
    this.injectJavaScript(`window.processImage("${imageBase64DataUri}");`);
  };

  setContrast = () => {
    const { contrast } = this.props;
    this.injectJavaScript(`window.setImageContrast(${contrast});`);
  };

  setAndApplyContrast = () => {
    const { contrast } = this.props;
    this.injectJavaScript(`window.setAndApplyImageContrast(${contrast})`);
  };

  requestRawResult = () => {
    this.injectJavaScript("window.requestRawResult();");
  };

  computeResult = () => {
    this.setContrast();
    this.processImage();
  };

  handleWebviewLoaded = () => {
    this.computeResult();
  };

  reloadWebView = () => {
    this.webViewRef?.reload();
  };

  render() {
    const { debug = false } = this.props;
    return (
      <>
        <InjectedCodeDebugger debug={debug} injectedCode={injectedCode} />
        <Flex flex={0}>
          <WebView
            ref={c => (this.webViewRef = c)}
            injectedJavaScript={injectedCode}
            androidLayerType="software"
            androidHardwareAccelerationDisabled
            onLoadEnd={this.handleWebviewLoaded}
            onMessage={this.handleMessage}
          />
        </Flex>
      </>
    );
  }
}
