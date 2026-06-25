'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { GitBranchIcon } from 'lucide-react';

export function SignInButton() {
  return (
    <Button onClick={() => authClient.signIn.social({ provider: 'github' })}>
      Sign in with GitHub <GitBranchIcon />
    </Button>
  );
}
