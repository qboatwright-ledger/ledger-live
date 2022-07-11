import React, { PropsWithChildren } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import RequiresAndroidPermissions from "../RequiresAndroidPermissions";
import { AndroidPermissionWithExplanation } from "../RequiresAndroidPermissions/types";

// TODO: get proper wording & put in wording files

export const androidPermissions: AndroidPermissionWithExplanation[] =
  Platform.OS === "android"
    ? [
        {
          title: "Access fine location",
          description: "Required to discover nearby Bluetooth devices.",
          permissionId: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        },
        ...(Platform.Version >= 31
          ? [
              {
                title: "Scan bluetooth",
                description:
                  "Required to discover and pair nearby Bluetooth devices.",
                permissionId: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              },
              {
                title: "Connect Bluetooth",
                description:
                  "Required to be able to connect to paired Bluetooth devices.",
                permissionId: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              },
            ]
          : []),
      ]
    : [];

const title = "Bluetooth permissions required.";
const description =
  "Some permissions are required to pair your device through Bluetooth.\nLedger does not access your location information.";

const RequiresBLEPermissions: React.FC<PropsWithChildren<{}>> = props => {
  const { children } = props;
  return (
    <RequiresAndroidPermissions
      permissions={androidPermissions}
      title={title}
      description={description}
    >
      {children}
    </RequiresAndroidPermissions>
  );
};

export default RequiresBLEPermissions;
