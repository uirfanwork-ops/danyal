"use client";

import { useActionState, useState } from "react";
import { setTeacherPay, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

const EMPTY: FormState = {};

const HELP: Record<string, string> = {
  monthly_salary: "A fixed amount paid every month, whatever else happens.",
  per_class: "An amount for each class actually taught. Needs attendance, which arrives in a later phase.",
  per_student: "An amount for each student enrolled with this teacher.",
  fee_share: "A percentage of the fees this teacher's students actually pay.",
};

export default function PayForm({
  teachers,
  currencySymbol,
}: {
  teachers: { id: string; name: string }[];
  currencySymbol: string;
}) {
  const [state, action] = useActionState(setTeacherPay, EMPTY);
  const [payType, setPayType] = useState("monthly_salary");

  return (
    <form action={action} className="form">
      <FormMessage state={state} />
      <div className="grid2">
        <div>
          <label htmlFor="p_teacher">Teacher</label>
          <select id="p_teacher" name="teacher_id" required>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p_type">Paid by</label>
          <select id="p_type" name="pay_type" value={payType}
                  onChange={(e) => setPayType(e.target.value)}>
            <option value="monthly_salary">Monthly salary</option>
            <option value="per_class">Per class taught</option>
            <option value="per_student">Per student enrolled</option>
            <option value="fee_share">Share of fees collected</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="p_rate">
          {payType === "fee_share" ? "Percentage" : `Amount (${currencySymbol})`}
        </label>
        <input id="p_rate" name="pay_rate" type="text" inputMode="decimal" required
               placeholder={payType === "fee_share" ? "e.g. 40" : "e.g. 40000"} />
        <p className="hint">{HELP[payType]}</p>
      </div>

      <SubmitButton>Save pay arrangement</SubmitButton>
    </form>
  );
}
