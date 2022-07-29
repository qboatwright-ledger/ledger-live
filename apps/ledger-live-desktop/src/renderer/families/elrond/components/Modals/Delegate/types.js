// @flow

import type { TFunction } from "react-i18next";
import type { Operation } from "@ledgerhq/types-live";
import type { Device } from "@ledgerhq/live-common/hw/actions/types";
import type { ElrondAccount, Transaction, TransactionStatus } from "@ledgerhq/live-common/families/elrond/types";
import type { Step } from "~/renderer/components/Stepper";


export type StepId = "castDelegations" | "connectDevice" | "confirmation";

export interface StepProps {
  t: TFunction;
  transitionTo: (param: string) => void;
  device?: Device;
  account?: ElrondAccount;
  parentAccount?: ElrondAccount;
  onRetry: () => void;
  onClose: () => void;
  openModal: (key: string, config?: any) => void;
  optimisticOperation: any;
  error: any;
  signed: boolean;
  transaction?: Transaction;
  status: TransactionStatus;
  onChangeTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onTransactionError: (error: Error) => void;
  onOperationBroadcasted: (operation: Operation) => void;
  setSigned: (assigned: boolean) => void;
  bridgePending: boolean;
  validators: any;
  delegations: any;
}

export type St = Step<StepId, StepProps>;
