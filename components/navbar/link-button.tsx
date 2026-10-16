'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LinkButtonProps {
  href: string;
  label: string;
}

export default function LinkButton({ href, label }: Readonly<LinkButtonProps>) {
  return (
    <Button size="sm" variant="ghost">
      <Link
        href={href}
        onClick={() => {
          return sendGTMEvent({
            event: 'buttonClicked',
            value: { href, label },
          });
        }}
      >
        {label}
      </Link>
    </Button>
  );
}
