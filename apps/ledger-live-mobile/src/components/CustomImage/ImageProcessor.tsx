import { Flex } from "@ledgerhq/native-ui";
import React from "react";
import { WebView } from "react-native-webview";
import { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { ImageProcessingError } from "./errors";
import { injectedCode } from "./injectedCode";
import { InjectedCodeDebugger } from "./InjectedCodeDebugger";
import { ImageBase64Data, ImageDimensions } from "./types";

export type ProcessorPreviewResult = ImageBase64Data & ImageDimensions;

export type ProcessorRawResult = { hexData: string } & ImageDimensions;

export type Props = ImageBase64Data & {
  onError: (error: Error) => void;
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
    const { onError, onPreviewResult, onRawResult } = this.props;
    const { type, payload } = JSON.parse(data);
    switch (type) {
      case "LOG":
        __DEV__ && console.log("WEBVIEWLOG:", payload); // eslint-disable-line no-console
        break;
      case "BASE64_RESULT":
        if (!payload.width || !payload.height || !payload.base64Data) {
          onError(new ImageProcessingError());
          return;
        }
        onPreviewResult({
          width: payload.width,
          height: payload.height,
          imageBase64DataUri: payload.base64Data,
        });
        break;
      case "RAW_RESULT":
        if (
          !payload.width ||
          !payload.height ||
          !payload.hexData ||
          payload.hexData.length !== payload.width * payload.height
        ) {
          onError(new ImageProcessingError());
          return;
        }
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

  handleWebViewError = ({ nativeEvent }: WebViewErrorEvent) => {
    const { onError } = this.props;
    console.error(nativeEvent);
    onError(new ImageProcessingError());
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
            onError={this.handleWebViewError}
            onLoadEnd={this.handleWebviewLoaded}
            onMessage={this.handleMessage}
          />
        </Flex>
      </>
    );
  }
}
