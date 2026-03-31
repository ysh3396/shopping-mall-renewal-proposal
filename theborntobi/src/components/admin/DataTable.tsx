"use client";

import { useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination = false,
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = pagination ? Math.ceil(data.length / pageSize) : 1;
  const paginatedData = pagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="text-xs font-semibold text-slate-500 uppercase"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {paginatedData.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-slate-400 py-8"
              >
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            {data.length}건 중 {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, data.length)}건
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
