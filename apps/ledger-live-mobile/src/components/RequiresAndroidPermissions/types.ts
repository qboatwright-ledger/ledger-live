import { PropsWithChildren } from "react";
import { PermissionsAndroid } from "react-native";

export type AndroidPermissionWithExplanation = {
  /** Short human-readable name for this permission. */
  title: string;

  /** Short explanation for why this permission is required. */
  description: string;

  /**
   * Android identifier of the permission.
   * see:
   * - React Native's PermissionsAndroid documentation:
   *   https://reactnative.dev/docs/permissionsandroid
   * - Android SDK documentation
   *   https://developer.android.com/reference/android/Manifest.permission
   */
  permissionId: typeof PermissionsAndroid["PERMISSIONS"][string];
};

export type FallbackComponentProps = {
  /** The list of permissions that are not granted. */
  ungrantedPermissions: AndroidPermissionWithExplanation[];

  /** A short title to display in the screen. */
  title: string;

  /** A description to display in the screen, giving more context. */
  description?: string;

  /** The function that will be called when pressing the retry button. */
  onRetry: () => void;
};

export type Props = PropsWithChildren<{
  /**
   * The list of permissions that need to be granted, with some wording for
   * each.
   * */
  permissions: AndroidPermissionWithExplanation[];

  /**
   * A short title to display in the fallback component that will be displayed
   * in case some of the permissions are not granted.
   */
  title: FallbackComponentProps["title"];

  /**
   * A description, giving more context, to display in the fallback component
   * that will be displayed in case some of the permissions are not granted.
   */
  description: FallbackComponentProps["description"];

  /**
   * A custom fallback component that will be displayed in case some of the
   * permissions are not granted.
   */
  FallbackComponent?: React.ComponentType<FallbackComponentProps>;
}>;
