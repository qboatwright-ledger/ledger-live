import React from "react";
import RequiresAndroidPermissions from "./RequiresAndroidPermissions";
import { Props } from "./types";

/**
 * On Android:
 *  This component will render its children only if the Android permissions
 *  passed as props are granted. Otherwise it will render a fallback component
 *  that can be customized as props.
 * On other platforms (iOS):
 *  This component will just render its children.
 */
export default RequiresAndroidPermissions;

export function withRequiresAndroidPermissions<P>(
  Component: React.ComponentType<P>,
  permissions: Props["permissions"],
  FallbackComponent: Props["FallbackComponent"],
  title: Props["title"],
  description: Props["description"],
): React.ComponentType<P> {
  return (props: P) => (
    <RequiresAndroidPermissions
      permissions={permissions}
      FallbackComponent={FallbackComponent}
      title={title}
      description={description}
    >
      <Component {...props} />
    </RequiresAndroidPermissions>
  );
}
