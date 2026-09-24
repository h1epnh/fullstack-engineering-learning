import { type Transaction, walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Card, EmptyState, ProgressBar, Screen, TransactionRow } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/** Exposed as `./History` (see vite.config.ts) — the full, unbounded transaction ledger. */
export default function History({ session }: { session: Session }) {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    walletService.getTransactions(session.id).then(setTransactions);
  }, [session.id]);

  return (
    <Screen title="Lịch sử giao dịch">
      <Card>
        {transactions === null ? (
          <ProgressBar label="Đang tải…" />
        ) : transactions.length === 0 ? (
          <EmptyState icon="inbox" text="Chưa có giao dịch nào." />
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.id} type={tx.type} amount={tx.amount} note={tx.note} createdAt={tx.createdAt} />
          ))
        )}
      </Card>
    </Screen>
  );
}
