// @flow
/* eslint import/no-cycle: 0 */
import { combineReducers } from "redux";
import accounts from "./accounts";
import settings from "./settings";
import appstate from "./appstate";
import ble from "./ble";
import ratings from "./ratings";
import postOnboarding from "./postOnboarding";
import type { AccountsState } from "./accounts";
import type { SettingsState } from "./settings";
import type { AppState } from "./appstate";
import type { BleState } from "./ble";
import type { RatingsState } from "./ratings";
import type { POState as PostOnboardingState } from "./postOnboarding";

export type State = {
  accounts: AccountsState,
  settings: SettingsState,
  appstate: AppState,
  ble: BleState,
  ratings: RatingsState,
  postOnboarding: PostOnboardingState,
};

// $FlowFixMe
const appReducer = combineReducers({
  accounts,
  settings,
  appstate,
  ble,
  ratings,
  postOnboarding,
});

const rootReducer = (state: State, action: *) => {
  if (__DEV__ && action.type === "DANGEROUSLY_OVERRIDE_STATE") {
    appReducer({ ...action.payload }, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
