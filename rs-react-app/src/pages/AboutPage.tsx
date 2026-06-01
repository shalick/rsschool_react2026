import styles from './AboutPage.module.css';

export function AboutPage() {
  return (
    <div className={styles.container}>
      <h1>About This Application</h1>
      <p>Developer: [Alexander Shabanovich / shalick]</p>
      <p>
        Built as part of the{' '}
        <a
          href="https://rs.school"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          RS School React Course
        </a>
      </p>
    </div>
  );
}
