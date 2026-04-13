import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalPortalProps {
  children: ReactNode;
}

export function ModalPortal({ children }: ModalPortalProps): JSX.Element {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    if (root) root.style.filter = 'blur(6px)';
    return () => {
      document.body.style.overflow = '';
      if (root) root.style.filter = '';
    };
  }, []);

  return createPortal(<>{children}</>, document.body);
}
