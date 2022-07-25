// @flow

import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useFeature } from "@ledgerhq/live-common/lib/featureFlags";
import connectApp from "@ledgerhq/live-common/hw/connectApp";
import { createAction } from "@ledgerhq/live-common/hw/actions/app";

import NavigationScrollView from "../components/NavigationScrollView";
import DeviceActionModal from "../../components/DeviceActionModal";
import Alert from "../../components/Alert";
import SelectDevice from "../../components/SelectDevice";
import LText from "../components/LText";
import Button from "../components/Button";

const action = createAction(connectApp);

function capitalize(str) {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
}

export default function DebugMultiAppInstall() {
  const { colors } = useTheme();
  const feature = useFeature("deviceInitialApps");

  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setOnCompleted] = useState(false);
  const [device, setDevice] = useState(null);

  // Dependencies are resolved in multiple ways, we are leveraging the appName
  // which should be capitalize and match the app name from the manager.
  // ie Bitcoin, not bitcoin.

  const list = feature?.params?.apps?.map(appName => ({
    appName: capitalize(appName),
  }));

  const isFeatureDisabled =
    isFeatureDisabled || !feature?.enabled || !list || !list.length;

  const onStart = useCallback(() => {
    setIsRunning(true);
  }, []);

  return (
    <NavigationScrollView>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {device ? (
          isCompleted ? (
            <Alert
              type={"success"}
              title={
                "Good news everyone! We've successfully installed all the required applications"
              }
            />
          ) : (
            <View>
              <LText tertiary style={styles.box}>
                {
                  "This screen will trigger the installation of the apps defined in the 'feature_device_initial_apps' feature flag and complete when done so."
                }
              </LText>

              <Button
                mt={2}
                type={"primary"}
                event={
                  "Debug, triggered app install of list defined on firebase"
                }
                disabled={isFeatureDisabled}
                onPress={onStart}
                title={"Launch"}
              />

              {isRunning ? (
                <DeviceActionModal
                  onClose={setIsRunning}
                  device={device}
                  onModalHide={setIsRunning}
                  // Optional success callback, but we could trigger some inline rendering if it makes
                  // more sense.
                  onResult={() => setOnCompleted(true)}
                  // We can leverage the connectApp action since it allows us to set dependencies
                  action={action}
                  // Requesting BOLOS as a target app name means that once dependencies are resolved
                  // we will complete the device action because we will inevitably be in the dashboard
                  request={{
                    appName: "BOLOS",
                    dependencies: list,
                  }}
                />
              ) : null}
            </View>
          )
        ) : (
          <SelectDevice onSelect={setDevice} />
        )}
      </View>
    </NavigationScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
  },
  box: {
    padding: 10,
  },
});
