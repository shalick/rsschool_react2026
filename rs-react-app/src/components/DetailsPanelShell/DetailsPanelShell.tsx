import styles from './DetailsPanelShell.module.css';

interface DetailsPanelShellProps {
  children?: React.ReactNode;
}

export function DetailsPanelShell({ children }: DetailsPanelShellProps) {
  return (
    <div className={styles.shell} role="complementary">
      {children}
    </div>
  );
}
