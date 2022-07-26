import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useFeature } from "@ledgerhq/live-common/lib/featureFlags";
import connectApp from "@ledgerhq/live-common/hw/connectApp";
import { createAction } from "@ledgerhq/live-common/hw/actions/app";
import { useSelector } from "react-redux";
import { lastSeenDeviceSelector } from "../../reducers/settings";
import NavigationScrollView from "../components/NavigationScrollView";
import DeviceActionModal from "../../components/DeviceActionModal";
import DeviceAction from "../../components/DeviceAction";
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
  const lastSeenDevice = useSelector(lastSeenDeviceSelector);

  const [isRunning, setIsRunning] = useState(false);
  const [useCustomUI, setUseCustomUI] = useState(false);
  const [list, setList] = useState([]);
  const [isCompleted, setOnCompleted] = useState(false);
  const [device, setDevice] = useState(null);

  // Dependencies are resolved in multiple ways, we are leveraging the appName
  // which should be capitalize and match the app name from the manager.
  // ie Bitcoin, not bitcoin.

  const isListValid = !isRunning && list?.length;

  const onStart = useCallback(() => {
    setIsRunning(true);
    setUseCustomUI(false);
  }, []);

  const onStartInline = useCallback(() => {
    setUseCustomUI(true);
    setIsRunning(true);
  }, []);

  const onUseFirebase = useCallback(() => {
    if (!feature || !feature?.params?.apps?.length) {
      setList([]);
      return;
    }

    setList(
      feature?.params?.apps?.map(appName => ({
        appName: capitalize(appName),
      })),
    );
  }, [feature]);

  const onUseLastSeenDevice = useCallback(() => {
    if (!lastSeenDevice || !lastSeenDevice?.apps) {
      setList([]);
      return;
    }

    setList(lastSeenDevice.apps.map(({ name: appName }) => ({ appName })));
  }, [lastSeenDevice]);

  const DeviceActionOrModal = useCustomUI ? DeviceAction : DeviceActionModal;
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
              {isRunning ? (
                <DeviceActionOrModal
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
                    withInlineInstallProgress: useCustomUI,
                  }}
                />
              ) : (
                <View>
                  <LText
                    tertiary
                    style={styles.box}
                  >{`Chosen list: ${JSON.stringify(list)}`}</LText>

                  <Button
                    mt={2}
                    type={"primary"}
                    event={"Debug, use firebase app list"}
                    onPress={onUseFirebase}
                    title={"Use list from Firebase"}
                  />
                  <Button
                    mt={2}
                    type={"primary"}
                    event={"Debug, use last seen device app list"}
                    onPress={onUseLastSeenDevice}
                    title={"Use list from LastSeenDevice"}
                  />

                  <Button
                    mt={2}
                    type={"primary"}
                    event={"Debug, triggered app install of list"}
                    disabled={!isListValid}
                    onPress={onStart}
                    title={"Install with device action"}
                  />

                  <Button
                    mt={2}
                    type={"primary"}
                    event={"Debug, triggered app inline install of list"}
                    disabled={!isListValid}
                    onPress={onStartInline}
                    title={"Install with custom UI"}
                  />
                </View>
              )}
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
