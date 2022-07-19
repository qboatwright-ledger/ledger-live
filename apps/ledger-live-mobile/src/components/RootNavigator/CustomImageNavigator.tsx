import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "styled-components/native";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";

export default function CustomImageNavigator() {
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig}>
      <Stack.Screen
        name={ScreenName.DiscoverScreen}
        component={() => null}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.CustomImageCroppingScreen}
        component={() => null}
      />
      <Stack.Screen
        name={ScreenName.CustomImagePreviewScreen}
        component={() => null}
      />
      <Stack.Screen
        name={ScreenName.CustomImageErrorScreen}
        component={() => null}
      />
      <Stack.Screen
        name={ScreenName.CustomImageTransferScreen}
        component={() => null}
      />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
