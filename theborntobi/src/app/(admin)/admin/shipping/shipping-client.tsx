"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Search,
  Truck,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { registerShipment, updateShipmentStatus } from "./actions";

interface ShipmentRow {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string | null;
  status: string;
  shippedAt: Date | null;
}

interface OrderItem {
  productName: string;
  variantName: string | null;
  quantity: number;
}

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  customer: CustomerInfo;
  shipment: ShipmentRow | null;
  items: OrderItem[];
}

interface Props {
  preparingOrders: OrderRow[];
  shippedOrders: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const shipmentStatusLabels: Record<string, string> = {
  PENDING: "대기",
  PICKED_UP: "집화완료",
  IN_TRANSIT: "배송중",
  OUT_FOR_DELIVERY: "배달중",
  DELIVERED: "배달완료",
  FAILED: "배달실패",
};

const shipmentStatusNext: Record<string, string> = {
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

function TrackingRegistrationRow({ order }: { order: OrderRow }) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("우체국택배");
  const [isPending, startTransition] = useTransition();

  function handleRegister() {
    if (!trackingNumber.trim()) return;
    startTransition(async () => {
      await registerShipment(order.id, trackingNumber.trim(), carrier);
      setTrackingNumber("");
    });
  }

  return (
    <TableRow className="hover:bg-amber-50/30">
      <TableCell className="font-mono text-sm text-slate-700">
        {order.orderNumber}
      </TableCell>
      <TableCell>
        <div className="font-medium text-slate-900 text-sm">{order.customer.name}</div>
        <div className="text-xs text-slate-400">{order.customer.phone ?? order.customer.email}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-slate-700">
          {order.items[0]?.productName ?? "-"}
          {order.items[0]?.variantName && (
            <span className="text-slate-400"> / {order.items[0].variantName}</span>
          )}
        </div>
        {order.items[0]?.quantity && (
          <div className="text-xs text-slate-400">{order.items[0].quantity}개</div>
        )}
      </TableCell>
      <TableCell className="text-sm text-slate-500">{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="우체국택배">우체국택배</option>
            <option value="CJ대한통운">CJ대한통운</option>
            <option value="한진택배">한진택배</option>
            <option value="로젠택배">로젠택배</option>
          </select>
          <Input
            placeholder="운송장 번호"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            className="h-8 w-36 text-xs"
          />
          <Button
            size="sm"
            disabled={isPending || !trackingNumber.trim()}
            onClick={handleRegister}
            className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs"
          >
            <Truck className="w-3 h-3 mr-1" />
            배송등록
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ShippedOrderRow({ order }: { order: OrderRow }) {
  const [isPending, startTransition] = useTransition();
  const shipment = order.shipment;

  if (!shipment) return null;

  const nextStatus = shipmentStatusNext[shipment.status];

  function handleAdvance() {
    if (!nextStatus || !shipment) return;
    startTransition(async () => {
      await updateShipmentStatus(shipment.id, nextStatus);
    });
  }

  return (
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="font-mono text-sm text-slate-700">
        {order.orderNumber}
      </TableCell>
      <TableCell>
        <div className="font-medium text-slate-900 text-sm">{order.customer.name}</div>
        <div className="text-xs text-slate-400">{order.customer.phone ?? order.customer.email}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm font-mono text-slate-700">{shipment.trackingNumber ?? "-"}</div>
        <div className="text-xs text-slate-400">{shipment.carrier}</div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
          {shipmentStatusLabels[shipment.status] ?? shipment.status}
        </span>
      </TableCell>
      <TableCell className="text-sm text-slate-500">
        {shipment.shippedAt ? formatDate(shipment.shippedAt) : "-"}
      </TableCell>
      <TableCell>
        {nextStatus ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleAdvance}
            className="h-7 text-xs"
          >
            {shipmentStatusLabels[nextStatus]}으로 변경
          </Button>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ShippingClient({
  preparingOrders,
  shippedOrders,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let searchTimeout: ReturnType<typeof setTimeout>;

  function navigate(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    const merged = { search: initialSearch, page: "1", ...overrides };
    if (merged.search) sp.set("search", merged.search);
    if (merged.page && merged.page !== "1") sp.set("page", merged.page);
    const qs = sp.toString();
    startTransition(() => {
      router.push(`/admin/shipping${qs ? `?${qs}` : ""}`);
    });
  }

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => navigate({ search: value, page: "1" }), 300);
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Search bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="주문번호 또는 운송장 번호 검색..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* 배송대기 section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-800">배송대기</h2>
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
            {preparingOrders.length}건
          </Badge>
        </div>
        <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
          {preparingOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              배송대기 주문이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50/60">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">상품</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문일</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">운송장 등록</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preparingOrders.map((order) => (
                  <TrackingRegistrationRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* 배송중 section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-800">배송중</h2>
          <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">
            {shippedOrders.length}건
          </Badge>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {shippedOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              배송중인 주문이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">주문번호</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">고객</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">운송장</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">배송상태</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">출고일</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase">상태변경</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippedOrders.map((order) => (
                  <ShippedOrderRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 mt-2">
            <span className="text-sm text-slate-500">
              {total}건 중 {(page - 1) * limit + 1}–{Math.min(page * limit, total)}건
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === 1}
                onClick={() => navigate({ page: String(page - 1) })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === totalPages}
                onClick={() => navigate({ page: String(page + 1) })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
