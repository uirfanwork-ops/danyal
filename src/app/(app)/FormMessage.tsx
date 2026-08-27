"use client";

export default function FormMessage({ state }: { state: { error?: string; ok?: string } }) {
  if (state.error) return <div className="notice error">{state.error}</div>;
  if (state.ok) return <div className="notice good">{state.ok}</div>;
  return null;
}
