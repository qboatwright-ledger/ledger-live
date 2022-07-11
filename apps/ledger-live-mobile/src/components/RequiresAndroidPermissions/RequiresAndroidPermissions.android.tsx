import React, { useEffect, useCallback, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { Flex, InfiniteLoader } from "@ledgerhq/native-ui";
import AndroidPermissionsMissingFallback from "./AndroidPermissionsMissingFallback";
import {
  AndroidPermissionWithExplanation,
  Props,
} from "./types";

type PermissionsState = Record<string, boolean | null>;

const RequiresAndroidPermissions: React.FC<Props> = props => {
  const { permissions, children, FallbackComponent } = props;

  const [permissionsState, setPermissionsState] = useState<PermissionsState>(
    Object.fromEntries(permissions.map(p => [p.permissionId, null])),
  );

  const checkPermissions = useCallback(async () => {
    const res = await Promise.all(
      permissions.map(async p => {
        const res = await PermissionsAndroid.check(p.permissionId);
        return [p.permissionId, res];
      }),
    );
    setPermissionsState(Object.fromEntries(res));
  }, [permissions, setPermissionsState]);

  const requestPermissions = useCallback(async () => {
    const res = await PermissionsAndroid.requestMultiple(
      permissions.map(p => p.permissionId),
    );
    setPermissionsState(
      Object.fromEntries(
        permissions.map(p => [
          p.permissionId,
          res[p.permissionId] === PermissionsAndroid.RESULTS.GRANTED,
        ]),
      ),
    );
  }, [permissions, setPermissionsState]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const ungrantedPermissions: AndroidPermissionWithExplanation[] = useMemo(
    () => permissions.filter(p => permissionsState[p.permissionId] === false),
    [permissions, permissionsState],
  );

  if (Object.values(permissionsState).every(val => val === null)) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center">
        <InfiniteLoader />
      </Flex>
    );
  }
  if (ungrantedPermissions.length > 0) {
    const FallbackC = FallbackComponent ?? AndroidPermissionsMissingFallback;
    return (
      <FallbackC
        title={props.title}
        description={props.description}
        ungrantedPermissions={ungrantedPermissions}
        onRetry={requestPermissions}
      />
    );
  }
  return <>{children}</>;
};

export default RequiresAndroidPermissions;
