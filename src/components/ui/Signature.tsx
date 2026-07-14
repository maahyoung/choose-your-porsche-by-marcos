export function Signature({ className = "" }: { className?: string }) {
  return (
    <span className={`signature ${className}`} aria-label="MMC signature">
      MMC
    </span>
  );
}
