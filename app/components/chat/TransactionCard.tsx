"use client";

import { Button } from "@/components/ui/button";

interface SendTransactionCardProps {
  type: "send";
  data: {
    token: string;
    amount: string;
    network: string;
    recipient: string;
    gasFee: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

interface ReceiveTransactionCardProps {
  type: "receive";
  data: {
    address: string;
    token: string;
  };
  onClose: () => void;
}

interface SwapTransactionCardProps {
  type: "swap";
  data: {
    fromToken: string;
    fromAmount: string;
    toToken: string;
    toAmount: string;
    rate: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

type TransactionCardProps = SendTransactionCardProps | ReceiveTransactionCardProps | SwapTransactionCardProps;

export const TransactionCard = (props: TransactionCardProps) => {
  if (props.type === "send") {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mt-3">
        <h3 className="text-lg font-semibold text-center mb-6">Send Coin</h3>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Token</span>
            <span className="font-medium">{props.data.token}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{props.data.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">{props.data.network}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recipient Address</span>
            <span className="font-medium">{props.data.recipient}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gas Fee</span>
            <span className="font-medium">{props.data.gasFee}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 nova-gradient"
            onClick={props.onConfirm}
          >
            Send Confirm
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By clicking Confirm, you approve this transaction in your wallet.
        </p>
      </div>
    );
  }

  if (props.type === "receive") {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mt-3">
        <h3 className="text-lg font-semibold text-center mb-6">Receive {props.data.token}</h3>

        <div className="flex flex-col items-center">
          <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center mb-4">
            <div className="text-xs text-muted-foreground">QR Code</div>
          </div>
          <p className="text-sm font-mono text-center break-all">
            {props.data.address}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={props.onClose}
        >
          Close
        </Button>
      </div>
    );
  }

  if (props.type === "swap") {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 max-w-sm mt-3">
        <h3 className="text-lg font-semibold text-center mb-6">Swap Tokens</h3>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{props.data.fromAmount} {props.data.fromToken}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{props.data.toAmount} {props.data.toToken}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium">{props.data.rate}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 nova-gradient"
            onClick={props.onConfirm}
          >
            Confirm Swap
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
