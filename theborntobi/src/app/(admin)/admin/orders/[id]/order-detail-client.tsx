"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, confirmDeposit, addOrderNote } from "../actions";
import {
  CheckCircle,
  Package,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Props {
  orderId: string;
  orderStatus: string;
  hasPayment: boolean;
  paymentMethod: string | null;
  existingNote: string | null;
}

const STATUS_ACTIONS: Record<
  string,
  { label: string; nextStatus: string; variant: "default" | "destructive" | "outline"; icon?: React.ReactNode }[]
> = {
  PENDING: [
    { label: "입금대기로 변경", nextStatus: "AWAITING_DEPOSIT", variant: "default" },
    { label: "주문취소", nextStatus: "CANCELLED", variant: "destructive" },
  ],
  AWAITING_DEPOSIT: [
    { label: "주문취소", nextStatus: "CANCELLED", variant: "destructive" },
  ],
  PAID: [
    { label: "배송준비 시작", nextStatus: "PREPARING", variant: "default" },
    { label: "주문취소", nextStatus: "CANCELLED", variant: "destructive" },
  ],
  PREPARING: [
    { label: "출고처리 (배송중)", nextStatus: "SHIPPED", variant: "default" },
    { label: "주문취소", nextStatus: "CANCELLED", variant: "destructive" },
  ],
  SHIPPED: [
    { label: "배송완료 처리", nextStatus: "DELIVERED", variant: "default" },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

export function OrderDetailClient({
  orderId,
  orderStatus,
  hasPayment,
  paymentMethod,
  existingNote,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [note, setNote] = useState(existingNote ?? "");
  const [noteSaving, setNoteSaving] = useState(false);

  const actions = STATUS_ACTIONS[orderStatus] ?? [];
  const showDepositButton =
    orderStatus === "AWAITING_DEPOSIT" &&
    hasPayment &&
    paymentMethod === "BANK_TRANSFER";

  async function handleStatusChange(nextStatus: string) {
    if (!confirm(`상태를 "${nextStatus}"로 변경하시겠습니까?`)) return;
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      router.refresh();
    });
  }

  async function handleConfirmDeposit() {
    startTransition(async () => {
      await confirmDeposit(orderId);
      setShowDepositConfirm(false);
      router.refresh();
    });
  }

  async function handleSaveNote() {
    setNoteSaving(true);
    await addOrderNote(orderId, note);
    setNoteSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Status Action Buttons */}
      {(actions.length > 0 || showDepositButton) && (
        <div className="flex items-center gap-2 flex-wrap">
          {showDepositButton && (
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
              disabled={isPending}
              onClick={() => setShowDepositConfirm(true)}
            >
              <CheckCircle className="w-4 h-4" />
              입금확인
            </Button>
          )}
          {actions.map((action) => (
            <Button
              key={action.nextStatus}
              variant={action.variant}
              disabled={isPending}
              onClick={() => handleStatusChange(action.nextStatus)}
              className={
                action.variant === "default"
                  ? "bg-blue-500 hover:bg-blue-600 text-white gap-2"
                  : "gap-2"
              }
            >
              {action.nextStatus === "PREPARING" && <Package className="w-4 h-4" />}
              {action.nextStatus === "SHIPPED" && <Truck className="w-4 h-4" />}
              {action.nextStatus === "DELIVERED" && <CheckCircle className="w-4 h-4" />}
              {action.nextStatus === "CANCELLED" && <XCircle className="w-4 h-4" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Deposit Confirmation Dialog */}
      {showDepositConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">입금 확인</h3>
                <p className="text-sm text-slate-500">
                  입금을 확인하고 결제완료로 변경합니다.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              입금 확인 후에는 되돌릴 수 없습니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDepositConfirm(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleConfirmDeposit}
                disabled={isPending}
              >
                {isPending ? "처리중..." : "입금 확인"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">메모 추가</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="주문에 대한 메모를 입력하세요..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-700 placeholder-slate-400"
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveNote}
            disabled={noteSaving}
          >
            {noteSaving ? "저장 중..." : "메모 저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
