import BigNumber from "bignumber.js";
import { isValidAddress } from "@celo/utils/lib/address";
import type { Account } from "@ledgerhq/types-live";
import { Transaction } from "./types";
import getFeesForTransaction from "./js-getFeesForTransaction";

const sameFees = (a, b) => (!a || !b ? a === b : a.eq(b));

const prepareTransaction = async (
  account: Account,
  transaction: Transaction
) => {
  if (transaction.recipient && !isValidAddress(transaction.recipient))
    return transaction;

  if (["send", "vote"].includes(transaction.mode) && !transaction.recipient)
    return transaction;

  if (
    transaction.mode === "vote" &&
    !transaction.useAllAmount &&
    new BigNumber(transaction.amount).lte(0)
  )
    return transaction;

  const fees = await getFeesForTransaction({ account, transaction });

  if (!sameFees(transaction.fees, fees)) {
    return { ...transaction, fees };
  }

  return transaction;
};

export default prepareTransaction;
