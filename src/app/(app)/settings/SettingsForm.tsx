"use client";

import { useActionState } from "react";
import { updateSettings, type FormState } from "./actions";
import SubmitButton from "../SubmitButton";
import FormMessage from "../FormMessage";

const EMPTY: FormState = {};

export default function SettingsForm({
  settings,
}: {
  settings: {
    academy_name: string;
    currency_code: string;
    currency_symbol: string;
    fee_due_day: number;
  };
}) {
  const [state, action] = useActionState(updateSettings, EMPTY);

  return (
    <form action={action} className="form">
      <FormMessage state={state} />

      <div>
        <label htmlFor="academy_name">Academy name</label>
        <input id="academy_name" name="academy_name" type="text" required
               defaultValue={settings.academy_name} />
        <p className="hint">Shown in the top left corner and on receipts later.</p>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="currency_code">Currency code</label>
          <input id="currency_code" name="currency_code" type="text" required maxLength={3}
                 defaultValue={settings.currency_code} placeholder="CAD" />
          <p className="hint">Three letters — CAD, PKR, USD, GBP.</p>
        </div>
        <div>
          <label htmlFor="currency_symbol">Symbol</label>
          <input id="currency_symbol" name="currency_symbol" type="text" required maxLength={4}
                 defaultValue={settings.currency_symbol} placeholder="$" />
          <p className="hint">Shown before every amount.</p>
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="fee_due_day">Fees due on day</label>
          <input id="fee_due_day" name="fee_due_day" type="text" inputMode="numeric" required
                 defaultValue={String(settings.fee_due_day)} />
          <p className="hint">Between 1 and 28, so it exists in every month.</p>
        </div>
      </div>

      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
