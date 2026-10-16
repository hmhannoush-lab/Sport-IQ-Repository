import { cn } from "@/lib/utils";
import logoAsset from "@/assets/vital-logo.png.asset.json";

interface Props {
  className?: string;
}

export const VitalLogo = ({ className }: Props) => (
  <img
    src={logoAsset.url}
    alt="Sport IQ"
    className={cn(className)}
  />
);
