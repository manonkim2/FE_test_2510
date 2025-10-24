interface ButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  text?: string;
}

const Button = ({ onClick, disabled = false, text = "다음" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded disabled:opacity-50 border cursor-pointer"
    >
      {text}
    </button>
  );
};

export default Button;
