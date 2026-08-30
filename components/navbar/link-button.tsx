'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

interface LinkButtonProps {
  href: string;
  label: string;
}

export default function LinkButton({ href, label }: Readonly<LinkButtonProps>) {
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      onClick={() => {
        return sendGTMEvent({ event: 'buttonClicked', value: { href, label } });
      }}
    >
      {label}
    </Link>
  );
}
