import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import CroppingScreen from "../../screens/CustomImage/CroppingScreen";
import PreviewScreen from "../../screens/CustomImage/PreviewScreen";
import DebugScreen from "../../screens/CustomImage/DebugScreen";

const Empty = () => null;

export default function CustomImageNavigator() {
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig}>
      <Stack.Screen
        name={ScreenName.CustomImageCroppingScreen}
        component={CroppingScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name={ScreenName.CustomImagePreviewScreen}
        component={PreviewScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name={ScreenName.CustomImageErrorScreen}
        component={Empty}
        options={{ title: "" }}
      />
      <Stack.Screen
        name={ScreenName.CustomImageTransferScreen}
        component={Empty}
        options={{ title: "" }}
      />
      <Stack.Screen
        name={ScreenName.ImagePicker}
        component={DebugScreen}
        options={{ title: "Custom Img Debug" }}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
