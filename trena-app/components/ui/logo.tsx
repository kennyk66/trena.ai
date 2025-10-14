import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoVariant = 'full' | 'symbol' | 'symbol-only';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 80, height: 24 },
  sm: { width: 120, height: 36 },
  md: { width: 160, height: 48 },
  lg: { width: 200, height: 60 },
  xl: { width: 240, height: 72 },
};

const symbolSizeMap: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const isSymbolOnly = variant === 'symbol' || variant === 'symbol-only';
  const dimensions = isSymbolOnly ? symbolSizeMap[size] : sizeMap[size];

  const logoSrc =
    variant === 'full'
      ? '/images/Trena_logo-color.svg'
      : '/images/Trena_symbol-color.svg';

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <Image
        src={logoSrc}
        alt="Trena.ai"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="object-contain"
      />
    </div>
  );
}
