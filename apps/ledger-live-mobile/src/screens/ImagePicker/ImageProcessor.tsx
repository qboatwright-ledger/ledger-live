import React from "react";
import { WebView } from "react-native-webview";
import { injectedCode } from "./injectedCode";
import { InjectedCodeDebugger } from "./InjectedCodeDebugger";

type Props = {
  srcImageBase64: string;
  onPreviewResult: (arg: {
    base64Data: string;
    width: number;
    height: number;
  }) => void;
  onRawResult: (arg: {
    hexData: string;
    width: number;
    height: number;
  }) => void;
  /**
   * number >= 0
   *  - 0:  full black
   *  - 1:  original contrast
   *  - >1: more contrasted than the original
   * */
  contrast: number;
};

/**
 * using a class component here because we need to access some methods from
 * the parent using a ref
 *  */
export default class ImageProcessor extends React.Component<Props> {
  webViewRef: WebView<{}> | null = null;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.contrast !== this.props.contrast) this.setAndApplyContrast();
    if (prevProps.srcImageBase64 !== this.props.srcImageBase64)
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
          base64Data: payload.base64Data,
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
    const { srcImageBase64 } = this.props;
    this.injectJavaScript(`window.processImage("${srcImageBase64}");`);
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
    return (
      <>
        <InjectedCodeDebugger injectedCode={injectedCode} />
        <WebView
          ref={c => (this.webViewRef = c)}
          injectedJavaScript={injectedCode}
          androidLayerType="software"
          androidHardwareAccelerationDisabled
          style={{ height: 0 }}
          onLoadEnd={this.handleWebviewLoaded}
          onMessage={this.handleMessage}
        />
      </>
    );
  }
}
