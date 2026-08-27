"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createStudent, updateStudent, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

type Student = {
  id: string;
  student_code: string | null;
  full_name: string;
  phone: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  joined_on: string;
  status: string;
  notes: string | null;
};

const EMPTY: FormState = {};

export default function StudentForm({
  student,
  currencySymbol,
}: {
  student?: Student;
  currencySymbol?: string;
}) {
  const editing = !!student;
  const [state, action] = useActionState(editing ? updateStudent : createStudent, EMPTY);

  return (
    <form action={action} className="form">
      {editing ? <input type="hidden" name="id" value={student.id} /> : null}
      <FormMessage state={state} />

      <div className="grid2">
        <div>
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" type="text" required
                 defaultValue={student?.full_name ?? ""} />
        </div>
        <div>
          <label htmlFor="student_code">Student ID <span className="opt">optional</span></label>
          <input id="student_code" name="student_code" type="text"
                 defaultValue={student?.student_code ?? ""} />
          <p className="hint">Your own roll number, if you use one.</p>
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="guardian_name">Guardian name <span className="opt">optional</span></label>
          <input id="guardian_name" name="guardian_name" type="text"
                 defaultValue={student?.guardian_name ?? ""} />
        </div>
        <div>
          <label htmlFor="guardian_phone">Guardian phone <span className="opt">optional</span></label>
          <input id="guardian_phone" name="guardian_phone" type="tel"
                 defaultValue={student?.guardian_phone ?? ""} />
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="phone">Student phone <span className="opt">optional</span></label>
          <input id="phone" name="phone" type="tel" defaultValue={student?.phone ?? ""} />
        </div>
        <div>
          <label htmlFor="joined_on">Date joined</label>
          <input id="joined_on" name="joined_on" type="date"
                 defaultValue={student?.joined_on ?? new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={student?.status ?? "active"}>
            <option value="active">Active</option>
            <option value="on_leave">On leave</option>
            <option value="left">Left</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {!editing ? (
          <div>
            <label htmlFor="monthly_fee">
              Monthly fee <span className="opt">optional</span>
            </label>
            <input id="monthly_fee" name="monthly_fee" type="text" inputMode="decimal"
                   placeholder={`e.g. 5000`} />
            <p className="hint">
              In {currencySymbol ?? "$"}. You can set or change this later.
            </p>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="notes">Notes <span className="opt">optional</span></label>
        <textarea id="notes" name="notes" defaultValue={student?.notes ?? ""} />
      </div>

      <div className="btn-row">
        <SubmitButton>{editing ? "Save changes" : "Add student"}</SubmitButton>
        <Link className="btn ghost" href={editing ? `/students/${student.id}` : "/students"}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
