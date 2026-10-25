/** Short text with `code` spans, as written in content (hints, plan steps). Nothing else is formatted. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </>
  );
}
