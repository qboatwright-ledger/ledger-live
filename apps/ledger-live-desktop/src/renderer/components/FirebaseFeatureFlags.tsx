import React, { useState, ReactNode } from "react";
import isEqual from "lodash/isEqual";
import { FeatureFlagsProvider } from "@ledgerhq/live-common/featureFlags/index";
import { Feature, FeatureId } from "@ledgerhq/live-common/types/index";
import { getValue } from "firebase/remote-config";

import { formatFeatureId, useFirebaseRemoteConfig } from "./FirebaseRemoteConfig";

type Props = {
  children?: ReactNode;
};

export const FirebaseFeatureFlagsProvider = ({ children }: Props): JSX.Element => {
  const remoteConfig = useFirebaseRemoteConfig();
  const [localOverrides, setLocalOverrides] = useState({});

  const getFeature = (key: FeatureId, allowOverride = true): Feature | null => {
    if (!remoteConfig) {
      return null;
    }

    try {
      // Nb prioritize local overrides
      if (allowOverride && localOverrides[key]) {
        return localOverrides[key];
      }

      const value = getValue(remoteConfig, formatFeatureId(key));
      const feature: Feature = JSON.parse(value.asString());

      return feature;
    } catch (error) {
      console.error(`Failed to retrieve feature "${key}"`);
      return null;
    }
  };

  const overrideFeature = (key: FeatureId, value: Feature): void => {
    const actualRemoteValue = getFeature(key, false);
    if (!isEqual(actualRemoteValue, value)) {
      const overridenValue = { ...value, overridesRemote: true };
      setLocalOverrides(currentOverrides => ({ ...currentOverrides, [key]: overridenValue }));
    } else {
      console.error("Not overriding");
    }
  };

  const resetFeature = (key: FeatureId): void => {
    setLocalOverrides(currentOverrides => ({ ...currentOverrides, [key]: undefined }));
  };

  return (
    <FeatureFlagsProvider
      getFeature={getFeature}
      overrideFeature={overrideFeature}
      resetFeature={resetFeature}
    >
      {children}
    </FeatureFlagsProvider>
  );
};
