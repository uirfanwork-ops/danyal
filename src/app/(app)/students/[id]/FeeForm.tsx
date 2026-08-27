"use client";

import { useActionState } from "react";
import { setFee, type FormState } from "../actions";
import SubmitButton from "../../SubmitButton";
import FormMessage from "../../FormMessage";

const EMPTY: FormState = {};

export default function FeeForm({
  studentId,
  currencySymbol,
}: {
  studentId: string;
  currencySymbol: string;
}) {
  const [state, action] = useActionState(setFee, EMPTY);

  return (
    <form action={action} className="form">
      <input type="hidden" name="student_id" value={studentId} />
      <FormMessage state={state} />

      <div className="grid2">
        <div>
          <label htmlFor="amount">Monthly fee ({currencySymbol})</label>
          <input id="amount" name="amount" type="text" inputMode="decimal" required placeholder="5000" />
        </div>
        <div>
          <label htmlFor="effective_from">Starting from</label>
          <input id="effective_from" name="effective_from" type="date" required
                 defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div>
        <label htmlFor="note">Reason <span className="opt">optional</span></label>
        <input id="note" name="note" type="text" placeholder="e.g. annual increase" />
      </div>

      <p className="hint" style={{ marginTop: 0 }}>
        Changing a fee adds a new entry rather than overwriting the old one, so past
        months keep the amount that actually applied to them.
      </p>

      <SubmitButton>Set fee</SubmitButton>
    </form>
  );
}
