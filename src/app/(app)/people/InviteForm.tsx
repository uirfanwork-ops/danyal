"use client";

import { useActionState, useState } from "react";
import { invitePerson, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

const EMPTY: FormState = {};

export default function InviteForm({ teachers }: { teachers: { id: string; name: string }[] }) {
  const [state, action] = useActionState(invitePerson, EMPTY);
  const [role, setRole] = useState("staff");

  return (
    <form action={action} className="form">
      <FormMessage state={state} />
      <div className="grid2">
        <div>
          <label htmlFor="i_name">Full name</label>
          <input id="i_name" name="full_name" type="text" required />
        </div>
        <div>
          <label htmlFor="i_email">Email</label>
          <input id="i_email" name="email" type="email" required />
        </div>
      </div>
      <div className="grid2">
        <div>
          <label htmlFor="i_role">Role</label>
          <select id="i_role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Office staff</option>
            <option value="teacher">Teacher</option>
          </select>
          <p className="hint">
            {role === "staff"
              ? "Can add students and record payments, but cannot approve discounts, reverse a payment, or see teacher pay."
              : "Sees only their own classes, their own students, and their own pay."}
          </p>
        </div>
        {role === "teacher" ? (
          <div>
            <label htmlFor="i_teacher">Which teacher record?</label>
            <select id="i_teacher" name="teacher_id" required>
              <option value="">Choose…</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <SubmitButton>Send invitation</SubmitButton>
    </form>
  );
}
