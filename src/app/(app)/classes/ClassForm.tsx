"use client";

import { useActionState } from "react";
import { createClass, updateClass, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

const EMPTY: FormState = {};

export default function ClassForm({
  teachers,
  existing,
}: {
  teachers: { id: string; name: string }[];
  existing?: { id: string; name: string; teacher_id: string | null; status: string };
}) {
  const editing = !!existing;
  const [state, action] = useActionState(editing ? updateClass : createClass, EMPTY);

  return (
    <form action={action} className="form">
      {editing ? <input type="hidden" name="id" value={existing.id} /> : null}
      <FormMessage state={state} />

      <div className="grid2">
        <div>
          <label htmlFor="c_name">Class name</label>
          <input id="c_name" name="name" type="text" required
                 defaultValue={existing?.name ?? ""}
                 placeholder="e.g. Grade 9 Physics" />
        </div>
        <div>
          <label htmlFor="c_teacher">Teacher <span className="opt">optional</span></label>
          <select id="c_teacher" name="teacher_id" defaultValue={existing?.teacher_id ?? ""}>
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {editing ? (
        <div className="grid2">
          <div>
            <label htmlFor="c_status">Status</label>
            <select id="c_status" name="status" defaultValue={existing.status}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      ) : null}

      <SubmitButton>{editing ? "Save changes" : "Create class"}</SubmitButton>
    </form>
  );
}
