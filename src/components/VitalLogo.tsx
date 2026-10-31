import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const VitalLogo = ({ className }: Props) => (
  <img
    src="/vital-logo.png"
    alt="Sport IQ"
    className={cn(className)}
  />
);
