import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import type { AlgorandTransaction } from "../types";
import { sync, scanAccounts } from "../js-synchronization";
import {
  createTransaction,
  prepareTransaction,
} from "../js-prepareTransaction";
import { estimateMaxSpendable } from "../js-estimateMaxSpendable";
import { getTransactionStatus } from "../js-getTransactionStatus";
import { signOperation } from "../js-signOperation";
import { broadcast } from "../js-broadcast";
import type { AccountBridge, CurrencyBridge } from "@ledgerhq/types-live";
import { toAlgorandResourcesRaw as toResourcesRaw } from "../serialization";
import { fromAlgorandResourcesRaw as fromResourcesRaw } from "../serialization";

const receive = makeAccountBridgeReceive();

const updateTransaction = (t, patch) => {
  return { ...t, ...patch };
};

const preload = async () => Promise.resolve({});

const hydrate = () => {};

const currencyBridge: CurrencyBridge = {
  preload,
  hydrate,
  scanAccounts,
};

const accountBridge: AccountBridge<AlgorandTransaction> = {
  createTransaction,
  updateTransaction,
  prepareTransaction,
  getTransactionStatus,
  sync,
  receive,
  toResourcesRaw,
  fromResourcesRaw,  
  signOperation,
  broadcast,
  estimateMaxSpendable,
};

export default {
  currencyBridge,
  accountBridge,
};
