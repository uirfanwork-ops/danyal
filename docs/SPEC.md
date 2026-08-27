# Academy Manager — Specification, Draft 1

**Status:** draft for your review. No code has been written.
**Written for:** the academy owner. No programming knowledge assumed.

Anything marked **`[ASSUMPTION]`** is a decision I made on your behalf so we could
keep moving. Read those first — they are the fastest way for you to steer this.
Correct any of them and I will revise this document before building.

---

## 1. What you have already decided

| Decision | Your answer |
|---|---|
| What version 1 must do | Student fees, payments & discounts · Teacher payouts · Attendance |
| Who logs in | You (owner), office/admin staff, teachers |
| How a fee is calculated | A flat monthly fee per student |
| Where your data lives today | Excel / Google Sheets — so we need an importer |

One thing I have **moved out of version 1 on my own judgement**: a login for
parents and students. You asked for it, and it is a good idea — but it means
issuing and supporting passwords for hundreds of families, and every data error
becomes a phone call. It is far safer to build it once your records are clean and
proven. The system below is *designed* so the portal can be added later without
rework. If you disagree, say so and I will put it back into version 1.

---

## 2. The whole system in four words

Every rupee that moves through your academy goes through the same four steps:

1. **CHARGE** — On the 1st of each month, every active student is billed their
   agreed monthly fee. This creates an *invoice* — a bill for that one month.
2. **DISCOUNT** — If that student has a discount, it is written onto that invoice
   as its own line, showing the full fee, the discount, and the reason.
3. **PAYMENT** — When money arrives, you record it against that invoice.
4. **LOG** — Every one of the above is written into a single permanent list
   called the *ledger*.

Everything else in the app — the dashboard, the reports, the defaulters list — is
just a different view of those four things.

### Why the ledger matters

You asked for "a log for all payment transactions." Here is the rule that makes
that log worth having:

> **Nothing is ever edited. Nothing is ever deleted.**

If your staff types 50,000 when they meant 5,000, the system does **not** quietly
fix the number. It adds a second entry that cancels the first, and then a third
with the correct amount. All three stay visible forever, each stamped with who did
it and when.

This feels clumsy for about a week. Then one day a parent insists they paid, or a
number looks wrong at month-end, and you can prove exactly what happened. A system
that lets you edit history cannot answer that question — and it is the single most
common reason small business software gets abandoned.

---

## 3. Rules the system will enforce

These are non-negotiable engineering decisions. You do not need to understand the
reasoning, but they are recorded here so nothing is a surprise later.

1. **Money is stored as whole numbers** (paisa/cents), never as decimals.
   Decimals drift — 0.1 + 0.2 does not equal 0.3 inside a computer. Whole numbers
   mean your totals will still be exact after ten thousand transactions.
2. **A student's balance is never stored.** It is added up from the ledger every
   time it is shown. A stored balance can silently disagree with the transactions
   behind it; a calculated one cannot.
3. **A discount is frozen onto the invoice** when the invoice is created.
   Changing a student's discount in March does not rewrite what their January bill
   said. History stays true.
4. **Every entry records who did it and when** — automatically, not by typing.
5. **Corrections are reversals, never edits** (see above).

---

## 4. What the system keeps track of

Plain-English description of each record the system will hold.

### Student
Name, a student ID number, contact phone, guardian name and phone, date joined,
status (active / on leave / left / completed), and their agreed monthly fee.

### Fee arrangement
The monthly amount this student has agreed to pay, and the date it took effect.
Kept as a dated history, so raising fees in September does not corrupt the record
of what they were charged in August.

### Discount
Attached to a student. Records the type (percentage or fixed amount), the value,
the reason, who approved it, the date it starts, and optionally a date it ends.

`[ASSUMPTION D1]` Both percentage and fixed-amount discounts are supported.
`[ASSUMPTION D2]` A discount is ongoing by default — it applies every month until
you remove it — and can also be marked as one-month-only.
`[ASSUMPTION D3]` A discount must have a written reason. The field cannot be left
blank. This is what makes your month-end discount report meaningful.
`[ASSUMPTION D4]` Office staff can *propose* a discount; only you can *approve*
one. Nothing reaches a student's bill without your approval.
`[ASSUMPTION D5]` If a student somehow has two discounts, they are applied one
after another to the already-reduced amount, and the system will never let the
total discount exceed the fee.

### Invoice (a month's bill)
Which student, which month, the full fee, each discount line, the final amount
due, and its status (unpaid / part paid / paid / cancelled).

`[ASSUMPTION I1]` Bills are generated on the 1st of the month, for that month.
`[ASSUMPTION I2]` A student joining mid-month is charged the full month.
`[ASSUMPTION I3]` One-off charges (admission fee, exam fee, books) can be added
to an invoice as extra lines.
`[ASSUMPTION I4]` No late fee is charged automatically. Unpaid months simply
accumulate as arrears and show on the defaulters list.
`[ASSUMPTION I5]` No sales tax / GST is calculated. These are receipts, not tax
invoices.

### Payment
Amount, date received, method, which invoice it settles, who recorded it, and a
receipt number.

`[ASSUMPTION P1]` Methods: cash, bank transfer, mobile wallet, cheque, card.
The exact list is a setting you can change without a programmer.
`[ASSUMPTION P2]` Partial payments are allowed. Owe 10,000, pay 4,000, and 6,000
stays outstanding.
`[ASSUMPTION P3]` Advance payments are allowed and sit as a credit on the
student's account, automatically applied to the next bill.
`[ASSUMPTION P4]` The system records money you have already received. It does
**not** collect card payments online. That is a much larger build and a separate
decision.
`[ASSUMPTION P5]` Only you can reverse a payment. Staff can record, not undo.

### Ledger entry
The permanent log. One line for every charge, discount, payment, reversal and
teacher payout — with date, amount, direction (in or out), who, and a reference
back to the invoice or payment it came from.

### Teacher
Name, contact, date joined, status, and their pay arrangement.

`[ASSUMPTION T1]` — **this is the biggest open question in the document.**
Because you have not yet told me how teachers are paid, I have designed the
system to support four arrangements, chosen per teacher:
  - a fixed monthly salary
  - a rate per class actually taught
  - a rate per student enrolled with them
  - a percentage share of the fees their students actually paid

The default will be fixed monthly salary. Tell me which one you really use and I
will make that the primary path and simplify the rest.

`[ASSUMPTION T2]` Advances to teachers are tracked and automatically deducted at
the next payout.
`[ASSUMPTION T3]` A teacher can see their own pay history, and nobody else's.

### Class / batch
A name, the teacher who takes it, the days and time it runs, and the students
enrolled in it.

### Attendance
For each class on each date: which students were present, absent or late, and
whether the class actually took place.

`[ASSUMPTION A1]` Attendance does **not** affect what a student is charged —
their fee is flat monthly, as you told me.
`[ASSUMPTION A2]` Attendance **can** affect teacher pay, but only for teachers on
a per-class arrangement.

---

## 5. The screens

### Dashboard — what you see when you open it
- Collected this month
- Outstanding this month
- Total discount given this month
- Count of students who have not paid
- The last ten transactions

`[ASSUMPTION S1]` These are the five things worth seeing daily. If there is a
number you actually check every morning that is not here, it belongs here instead.

### Students
A searchable list. Open one and you see their details, their fee, their discounts,
every invoice, every payment, their balance, and their attendance — on one screen.

### Record a payment
Deliberately the fastest screen in the app: find student, type amount, pick
method, save, print receipt. Your staff will use this more than everything else
combined, so it gets built to be quick.

### Discounts
Every discount in one place, with reason and approver. Filter by reason to answer
"how much am I giving away on sibling discounts?" A queue of discounts awaiting
your approval.

### Transaction log
The full permanent ledger. Searchable and filterable by date, student, staff
member and type. Exports to Excel.

### Invoices / month-end
Generate this month's bills, review before issuing, see who has paid.

### Attendance
Pick a class and a date, mark the register.

### Teachers & payouts
Teacher list, and a monthly payout run: what each teacher is owed, what advances
are deducted, and a button to mark each one paid — which writes to the same ledger.

### Reports
Monthly collection, outstanding by student, discounts given by reason, teacher
payout history. All exportable to Excel.

### Settings
Academy name, currency, fee due date, payment methods, discount reasons, staff
logins.

---

## 6. Who can do what

| | Owner | Office staff | Teacher |
|---|---|---|---|
| See all students | ✅ | ✅ | own classes only |
| Add / edit students | ✅ | ✅ | ❌ |
| Record a payment | ✅ | ✅ | ❌ |
| Reverse a payment | ✅ | ❌ | ❌ |
| Propose a discount | ✅ | ✅ | ❌ |
| Approve a discount | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | own classes |
| See teacher pay | ✅ | ❌ | own only |
| Run teacher payouts | ✅ | ❌ | ❌ |
| See reports & totals | ✅ | limited | ❌ |
| Change settings | ✅ | ❌ | ❌ |

`[ASSUMPTION R1]` Office staff can record money coming in but cannot undo it, and
cannot see academy-wide profit figures.

---

## 7. Open questions — the ones that actually change the build

Answer these and the assumptions above mostly settle themselves.

1. **How are teachers paid?** Fixed salary, per class, per student, or a share of
   fees? (See `[ASSUMPTION T1]` — this is the largest unknown.)
2. **What currency, and what country?** Do you need proper tax invoices?
3. **What discounts do you actually give?** Give me the real names you use —
   sibling, hardship, scholarship, staff child, early payment.
4. **Roughly how many students and teachers?** This changes nothing about the
   design, but it changes how much I invest in speed.
5. **A sample of your Excel** — even five rows with the names blanked out.
   Building an importer without seeing the real file is how migrations go wrong.

---

## 8. Build order

Each phase is usable on its own. You could stop after phase 3 and still have
something that runs your academy.

| Phase | What you get |
|---|---|
| 1 | Logins and roles · student records · teacher records · classes · **your Excel imported** |
| 2 | Fees · discounts with approval · monthly billing · **recording payments** · receipts · the permanent ledger |
| 3 | Dashboard · defaulters list · reports · export to Excel |
| 4 | Attendance |
| 5 | Teacher payouts, advances and deductions |
| 6 | *Later:* parent/student portal · automatic WhatsApp reminders · expenses and profit |

Phases 1 and 2 are where the value is. Phase 2 is the thing you originally asked
for.

---

## 9. Deliberately not in version 1

Listed so that "it doesn't do that" is never a surprise:

- Parent / student logins (see §1)
- Taking card payments online
- Automatic WhatsApp or SMS reminders — these need a paid gateway and a business
  account, so it is a decision with a cost attached
- Rent, salaries-other-than-teachers, utilities and true profit reporting
- Multiple branches
- Working without an internet connection
- Exam results and report cards

---

## 10. Technical decisions

Recorded for completeness. You do not need to act on these.

- **Backend:** Python with FastAPI
- **Database:** PostgreSQL — chosen deliberately. This system's job is to never
  lose or mangle money, and PostgreSQL guarantees that a payment and its ledger
  entry either both save or neither does. That guarantee is the whole reason to
  prefer it here.
- **Frontend:** React, laid out to work on a phone as well as a desktop
- **Money:** stored as whole minor units, single currency
- **Every change to money is recorded with the user who made it**

`[ASSUMPTION X1]` Single currency throughout.
`[ASSUMPTION X2]` This runs as a website you and your staff reach over the
internet, on phone or laptop — not a program installed on one office computer.

---

## Change log

- **Draft 1** — initial specification, from the first requirements conversation.
