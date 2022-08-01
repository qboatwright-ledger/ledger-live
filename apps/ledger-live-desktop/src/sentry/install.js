// @flow
import os from "os";
import pname from "~/logger/pname";
import anonymizer from "~/logger/anonymizer";
import "../env";

/* eslint-disable no-continue */

// will be overriden by setShouldSendCallback
// initially we will send errors (anonymized as we don't initially know "userId" neither)
let shouldSendCallback = () => true;

let productionBuildSampleRate = 0.5;
let tracesSampleRate = 0.001;

if (process.env.SENTRY_SAMPLE_RATE) {
  const v = parseFloat(process.env.SENTRY_SAMPLE_RATE);
  productionBuildSampleRate = v;
  tracesSampleRate = v;
}

const ignoreErrors = [
  // networking conditions
  "API HTTP",
  "DisconnectedError",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ERR_CONNECTION_RESET",
  "getaddrinfo",
  "HttpError",
  "Network Error",
  "NetworkDown",
  "NetworkDown",
  "NotConnectedError",
  "socket disconnected",
  "socket hang up",
  "status code 404",
  // timeouts
  "ERR_CONNECTION_TIMED_OUT",
  "request timed out",
  "SolanaTxConfirmationTimeout",
  "TimeoutError",
  "TronTransactionExpired", // user waits too long on device, possibly network slowness too
  "WebsocketConnectionError",
  // bad usage of device
  "BleError",
  "BluetoothRequired",
  "CantOpenDevice",
  "could not read from HID device",
  "DeviceOnDashboardExpected",
  "DisconnectedDevice",
  "DisconnectedDeviceDuringOperation",
  "EthAppPleaseEnableContractData",
  "failed with status code",
  "GetAppAndVersionUnsupportedFormat",
  "Invalid channel",
  "Ledger Device is busy",
  "ManagerDeviceLocked",
  "PairingFailed",
  // other
  "AccountAwaitingSendPendingOperations",
  "AccountNeedResync",
  "Cannot update while running on a read-only volume",
  "DeviceAppVerifyNotSupported",
  "InvalidAddressError",
  "Received an invalid JSON-RPC message",
  "SwapNoAvailableProviders",
  "TransactionRefusedOnDevice",
];

export function init(Sentry: any, opts: any) {
  if (!__SENTRY_URL__) return false;
  Sentry.init({
    dsn: __SENTRY_URL__,
    release: __APP_VERSION__,
    environment: __DEV__ ? "development" : "production",
    debug: __DEV__,
    ignoreErrors,
    sampleRate: __DEV__ ? 1 : productionBuildSampleRate,
    tracesSampleRate: __DEV__ ? 1 : tracesSampleRate,
    initialScope: {
      tags: {
        git_commit: __GIT_REVISION__,
        osType: os.type(),
        osRelease: os.release(),
        process: process?.title || "",
      },
      user: {
        ip_address: null,
      },
    },

    beforeSend(data: any, hint: any) {
      if (__DEV__) console.log("before-send", { data, hint });
      if (!shouldSendCallback()) return null;
      if (typeof data !== "object" || !data) return data;
      // $FlowFixMe
      delete data.server_name; // hides the user machine name
      anonymizer.filepathRecursiveReplacer(data);

      console.log("SENTRY REPORT", data);
      return data;
    },

    beforeBreadcrumb(breadcrumb) {
      switch (breadcrumb.category) {
        case "fetch":
        case "xhr": {
          // ignored, too verbose, lot of background http calls
          return null;
        }
        case "console": {
          if (pname === "internal") {
            // ignore console of internal because it's used to send to main and too verbose
            return null;
          }
        }
      }
      return breadcrumb;
    },

    ...opts,
  });

  Sentry.withScope(scope => scope.setExtra("process", pname));
  return true;
}

export function setShouldSendCallback(f: () => boolean) {
  shouldSendCallback = f;
}
