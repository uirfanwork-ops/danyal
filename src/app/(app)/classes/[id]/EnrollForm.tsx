"use client";

import { useActionState } from "react";
import { enrollStudent, type FormState } from "../actions";
import SubmitButton from "../../SubmitButton";
import FormMessage from "../../FormMessage";

const EMPTY: FormState = {};

export default function EnrollForm({
  classId,
  students,
}: {
  classId: string;
  students: { id: string; label: string }[];
}) {
  const [state, action] = useActionState(enrollStudent, EMPTY);

  return (
    <form action={action} className="form">
      <input type="hidden" name="class_id" value={classId} />
      <FormMessage state={state} />
      <div className="grid2">
        <div>
          <label htmlFor="e_student">Enrol a student</label>
          <select id="e_student" name="student_id" required>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <SubmitButton>Enrol</SubmitButton>
    </form>
  );
}
