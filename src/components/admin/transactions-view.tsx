"use client";

import { useEffect, useState } from "react";
import { Lock, Receipt } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types";
import { getTransactions } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InlineLoader } from "@/components/shared/loader";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney, formatDate } from "@/lib/utils";

const statusMeta: Record<string, string> = {
  succeeded:
    "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending:
    "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  failed:
    "border-red-300 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
};

/** Admin — Transactions: strictly read-only payment ledger. */
export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err: unknown) => {
        setTransactions([]);
        toast.error("Could not load transactions", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      });
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Subscription payments across the platform. Records are immutable —
            payments cannot be edited from the dashboard.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <Lock className="size-3" /> Read-only ledger
        </span>
      </div>

      {transactions === null ? (
        <InlineLoader className="py-16" />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Vendor subscription payments will appear here once Stripe confirms them."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Vendor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Stripe Session</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn._id}>
                  <TableCell>
                    <p className="text-sm font-semibold">
                      {txn.vendorBusinessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {txn.vendorName}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge className="border-transparent bg-forest text-gold-light">
                      {txn.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-heading font-bold text-gold">
                    {formatMoney(txn.amount, txn.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border ${statusMeta[txn.status]}`}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {txn.stripeSessionId.slice(0, 18)}…
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(txn.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
