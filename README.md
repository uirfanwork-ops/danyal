# Academy Manager

A management system for a teaching academy: student fees, discounts, a permanent
record of every payment, attendance, and teacher payouts.

**Status: specification stage. No application code has been written yet.**

Start here: **[docs/SPEC.md](docs/SPEC.md)** — the full plan in plain English.
It is written to be read by the academy owner, not by a programmer. Anything
marked `[ASSUMPTION]` is a guess that needs your yes or no before building starts.

## What it will do (version 1)

- Keep a record of every student and the monthly fee they've agreed to pay
- Apply discounts, with a reason and an approver recorded every single time
- Generate each month's bills automatically
- Record payments as they come in — cash, bank transfer, mobile wallet
- Keep a permanent, unalterable log of every transaction
- Track class attendance
- Work out what each teacher is owed each month and record when they were paid

## Repository layout

```
docs/SPEC.md     the specification (read this first)
```

Backend, frontend and database folders will be added once the specification is agreed.
