'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Link from 'next/link';

interface LinkButtonProps {
  href: string;
  label: string;
}

export default function LinkButton({ href, label }: Readonly<LinkButtonProps>) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
      onClick={() => {
        return sendGTMEvent({ event: 'buttonClicked', value: { href, label } });
      }}
    >
      {label}
    </Link>
  );
}
