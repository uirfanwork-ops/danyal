"use client";

import { useActionState } from "react";
import { addSlot, type FormState } from "../actions";
import SubmitButton from "../../SubmitButton";
import FormMessage from "../../FormMessage";
import { WEEKDAYS } from "@/lib/format";

const EMPTY: FormState = {};

export default function SlotForm({ classId }: { classId: string }) {
  const [state, action] = useActionState(addSlot, EMPTY);

  return (
    <form action={action} className="form">
      <input type="hidden" name="class_id" value={classId} />
      <FormMessage state={state} />
      <div className="grid2">
        <div>
          <label htmlFor="s_weekday">Day</label>
          <select id="s_weekday" name="weekday" defaultValue="1">
            {WEEKDAYS.map((day, i) => (
              <option key={day} value={i}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s_start">Starts</label>
          <input id="s_start" name="starts_at" type="time" required defaultValue="17:00" />
        </div>
        <div>
          <label htmlFor="s_end">Finishes</label>
          <input id="s_end" name="ends_at" type="time" required defaultValue="18:00" />
        </div>
      </div>
      <SubmitButton>Add time</SubmitButton>
    </form>
  );
}
