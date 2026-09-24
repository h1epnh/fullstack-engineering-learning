/**
 * Polls for the IPN-driven confirmation — see topup-service/web/IpnController.java and
 * DESIGN.md "Top-up flow": the synchronous /topups response is only an ACK, this screen
 * is what actually waits for money to move. Cancel just stops polling client-side (per
 * MoMo's own guideline to give an abort option on slow operations); it does not cancel
 * the underlying bank-side transaction, which the mock gateway will still resolve.
 */
export declare function TopupStatusScreen({ orderId, onDone }: {
    orderId: string;
    onDone: () => void;
}): import("react").JSX.Element;
