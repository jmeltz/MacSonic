interface FormatBadgeProps {
  isLossless: boolean;
}

export function FormatBadge({ isLossless }: FormatBadgeProps) {
  return (
    <div
      className="w-2 h-2 rounded-full shrink-0"
      style={{
        background: isLossless
          ? "var(--lossless-color)"
          : "var(--lossy-color)",
      }}
      title={isLossless ? "Lossless" : "Lossy"}
    />
  );
}
