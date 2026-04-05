import { cn } from "../utils/cn";

export default function CardBase({ children, className, onClick }) {
  return (
    <div className={cn("ark-card cursor-pointer", className)} onClick={onClick}>
      {children}
    </div>
  );
}
