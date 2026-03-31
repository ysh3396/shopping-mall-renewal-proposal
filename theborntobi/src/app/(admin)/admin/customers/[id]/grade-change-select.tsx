"use client";

import { useTransition } from "react";
import { updateCustomerGrade } from "../actions";

interface GradeInfo {
  id: string;
  name: string;
}

interface Props {
  customerId: string;
  currentGradeId: string;
  grades: GradeInfo[];
}

export function GradeChangeSelect({ customerId, currentGradeId, grades }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(gradeId: string) {
    startTransition(async () => {
      await updateCustomerGrade(customerId, gradeId);
    });
  }

  return (
    <select
      value={currentGradeId}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
    >
      <option value="">등급 없음</option>
      {grades.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}
