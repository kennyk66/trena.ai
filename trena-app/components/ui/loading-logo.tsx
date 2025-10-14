import Image from 'next/image';
import { cn } from '@/lib/utils';

type LoadingLogoSize = 'sm' | 'md' | 'lg';

interface LoadingLogoProps {
  size?: LoadingLogoSize;
  className?: string;
}

const sizeMap: Record<LoadingLogoSize, { width: number; height: number }> = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

export function LoadingLogo({ size = 'md', className }: LoadingLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative animate-pulse">
        <Image
          src="/images/Trena_symbol-color.svg"
          alt="Loading..."
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="object-contain animate-spin-slow"
        />
      </div>
      <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}
