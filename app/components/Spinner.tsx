interface SpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClassMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const Spinner = ({ label, size = "md" }: SpinnerProps) => {
  const sizeClass = sizeClassMap[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "로딩 중"}
      className="flex flex-col items-center gap-3 text-gray-500"
    >
      <span
        className={`inline-flex ${sizeClass} animate-spin rounded-full border-4 border-brand/20 border-t-brand`}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
};

export default Spinner;
