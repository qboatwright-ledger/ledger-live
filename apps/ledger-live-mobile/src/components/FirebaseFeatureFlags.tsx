import React, { useCallback, useState } from "react";
import isEqual from "lodash/isEqual";
import remoteConfig from "@react-native-firebase/remote-config";
import {
  FeatureFlagsProvider,
  defaultFeatures,
} from "@ledgerhq/live-common/featureFlags/index";
import { FeatureId } from "@ledgerhq/live-common/types/index";

import { formatFeatureId } from "./FirebaseRemoteConfig";

type Props = {
  children?: ReactNode;
};

const getFeature = (
  key: FeatureId,
  localOverrides?: { [name: FeatureId]: Feature },
) => {
  try {
    // Nb prioritize local overrides
    if (localOverrides[key]) {
      return localOverrides[key];
    }

    const value = remoteConfig().getValue(formatFeatureId(key));
    const feature = JSON.parse(value.asString());

    return feature;
  } catch (error) {
    console.error(`Failed to retrieve feature "${key}"`);
    return null;
  }
};

/**
 * @returns all flags that have different defaults are exported as a key value map
 */
export const getAllDivergedFlags = (): { [key in FeatureId]: boolean } => {
  const res: { [key in FeatureId]: boolean } = {};
  Object.keys(defaultFeatures).forEach(key => {
    const value = getFeature(key);
    if (value && value.enabled !== defaultFeatures[key].enabled) {
      res[key] = value.enabled;
    }
  });
  return res;
};

export const FirebaseFeatureFlagsProvider = ({ children }: Props) => {
  const [localOverrides, setLocalOverrides] = useState({});

  const overrideFeature = (key: FeatureId, value: Feature): void => {
    const actualRemoteValue = getFeature(key);
    if (!isEqual(actualRemoteValue, value)) {
      const overridenValue = { ...value, overridesRemote: true };
      setLocalOverrides(currentOverrides => ({
        ...currentOverrides,
        [key]: overridenValue,
      }));
    }
  };

  const resetFeature = (key: FeatureId): void => {
    setLocalOverrides(currentOverrides => ({
      ...currentOverrides,
      [key]: undefined,
    }));
  };

  // Nb wrapped because the method is also called from outside.
  const wrappedGetFeature = useCallback(
    (key: FeatureId): Feature => getFeature(key, localOverrides),
    [localOverrides],
  );

  return (
    <FeatureFlagsProvider
      getFeature={wrappedGetFeature}
      overrideFeature={overrideFeature}
      resetFeature={resetFeature}
    >
      {children}
    </FeatureFlagsProvider>
  );
};
