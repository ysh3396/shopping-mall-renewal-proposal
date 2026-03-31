import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Yellow/Amber
  PENDING: {
    label: "대기중",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  AWAITING_DEPOSIT: {
    label: "입금대기",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },

  // Green
  PAID: {
    label: "결제완료",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  COMPLETED: {
    label: "완료",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  DELIVERED: {
    label: "배송완료",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  APPROVED: {
    label: "승인됨",
    className: "bg-green-50 text-green-700 border-green-200",
  },

  // Blue
  PREPARING: {
    label: "준비중",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_TRANSIT: {
    label: "배송중",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "출고완료",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },

  // Red
  CANCELLED: {
    label: "취소됨",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  REJECTED: {
    label: "거절됨",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  FAILED: {
    label: "실패",
    className: "bg-red-50 text-red-700 border-red-200",
  },

  // Orange
  RETURN_REQUESTED: {
    label: "반품요청",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  EXCHANGE_REQUESTED: {
    label: "교환요청",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

interface StatusBadgeProps {
  status: string;
  variant?: "default";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
