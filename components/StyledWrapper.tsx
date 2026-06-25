import React from 'react';
import styles from './styled-wrapper.module.css';


export function StyledWrapper({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className={styles['matrix-container']}>
      <div className={styles['matrix-grid']}>
        {children}
      </div>
    </div>
  );
}