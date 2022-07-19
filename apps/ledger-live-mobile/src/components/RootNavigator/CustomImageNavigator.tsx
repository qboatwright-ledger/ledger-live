import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import CustomImageCroppingScreen from "../../screens/CustomImage/CustomImageCroppingScreen";

export default function CustomImageNavigator() {
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig} title="">
      <Stack.Screen
        name={ScreenName.CustomImageCroppingScreen}
        component={CustomImageCroppingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.CustomImagePreviewScreen}
        component={() => null}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.CustomImageErrorScreen}
        component={() => null}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.CustomImageTransferScreen}
        component={() => null}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
