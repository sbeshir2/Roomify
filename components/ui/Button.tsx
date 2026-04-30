import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullwidth?: boolean;
}

const Button = ({
  variant = "primary",
  size = "md",
  fullwidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const baseClass = "btn";

  // FIX: use backticks, not quotes
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;

  const fullWidthClass = fullwidth ? "btn--full" : "";

  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;