// renders children if BLE is available
// otherwise render an error

import React, { Component, PropsWithChildren } from "react";
import { Observable } from "rxjs";
import TransportBLE from "../../react-native-hw-transport-ble";
import BluetoothDisabled from "./BluetoothDisabled";
import RequiresBLEPermissions from "./RequiresBLEPermissions";

type Props = PropsWithChildren<{}>;

type State = {
  type: any;
};

class RequiresBLE extends Component<Props, State> {
  state = {
    type: "Unknown",
  };

  sub: any;

  componentDidMount() {
    this.sub = Observable.create(TransportBLE.observeState).subscribe({
      next: ({ type }) => this.setState({ type }),
    });
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { type } = this.state;
    if (type === "Unknown") return null; // suspense PLZ
    if (type === "PoweredOn") {
      return children;
    }
    return <BluetoothDisabled />;
  }
}

export default function RequiresBLEWrapped({ children }: any) {
  return (
    <RequiresBLEPermissions>
      <RequiresBLE>{children}</RequiresBLE>
    </RequiresBLEPermissions>
  );
}
