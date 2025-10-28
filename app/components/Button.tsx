interface ButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  text?: string;
  variant?: "primary" | "secondary";
}

const Button = ({
  onClick,
  disabled = false,
  text = "다음",
  variant = "primary",
}: ButtonProps) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 font-secondary text-sm font-medium transition";

  const primaryStyle = disabled
    ? "cursor-not-allowed border border-gray-400 bg-gray-400 text-gray-600"
    : "border border-transparent bg-brand text-white shadow-sm hover:bg-brand/90 cursor-pointer";

  const secondaryStyle =
    "inline-flex items-center justify-center rounded-2xl border border-brand px-6 py-3 font-secondary text-sm font-medium text-brand transition hover:bg-brand hover:text-white cursor-pointer";

  const appliedStyle =
    variant === "secondary" ? secondaryStyle : `${baseStyle} ${primaryStyle}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={appliedStyle}
    >
      {text}
    </button>
  );
};

export default Button;
