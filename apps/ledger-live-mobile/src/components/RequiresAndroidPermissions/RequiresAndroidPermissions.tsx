import React, { PropsWithChildren } from "react";
import { Props } from "./types";

const RequiresAndroidPermissions: React.FC<Props> = ({ children }) => (
  <>{children}</>
);

export default RequiresAndroidPermissions;
