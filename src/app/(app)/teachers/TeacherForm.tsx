"use client";

import { useActionState } from "react";
import { createTeacher, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

const EMPTY: FormState = {};

export default function TeacherForm() {
  const [state, action] = useActionState(createTeacher, EMPTY);

  return (
    <form action={action} className="form">
      <FormMessage state={state} />
      <div className="grid2">
        <div>
          <label htmlFor="t_full_name">Full name</label>
          <input id="t_full_name" name="full_name" type="text" required />
        </div>
        <div>
          <label htmlFor="t_phone">Phone <span className="opt">optional</span></label>
          <input id="t_phone" name="phone" type="tel" />
        </div>
      </div>
      <div className="grid2">
        <div>
          <label htmlFor="t_email">Email <span className="opt">optional</span></label>
          <input id="t_email" name="email" type="email" />
          <p className="hint">Needed later if you want to give them a login.</p>
        </div>
        <div>
          <label htmlFor="t_joined">Date joined <span className="opt">optional</span></label>
          <input id="t_joined" name="joined_on" type="date" />
        </div>
      </div>
      <div className="grid2">
        <div>
          <label htmlFor="t_status">Status</label>
          <select id="t_status" name="status" defaultValue="active">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="t_notes">Notes <span className="opt">optional</span></label>
        <textarea id="t_notes" name="notes" />
      </div>
      <SubmitButton>Add teacher</SubmitButton>
    </form>
  );
}
