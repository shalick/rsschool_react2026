import { useSubmissionStore } from '../../store/useSubmissionStore';
import classes from './SubmissionCardsList.module.css';

export function SubmissionCardsList() {
  const submissions = useSubmissionStore((state) => state.submissions);

  if (submissions.length === 0) {
    return <p className={classes.empty}>No form submissions yet.</p>;
  }

  return (
    <section className={classes.root} aria-label="Submission history">
      <h3 className={classes.heading}>Submission History</h3>
      <div className={classes.grid}>
        {submissions.map((submission) => (
          <article key={submission.id} className={classes.card}>
            <div className={classes.cardHeader}>
              <span className={classes.type}>{submission.type}</span>
              <time dateTime={submission.submittedAt} className={classes.time}>
                {new Date(submission.submittedAt).toLocaleString()}
              </time>
            </div>
            <p className={classes.field}>
              <strong>Name:</strong> {submission.name}
            </p>
            <p className={classes.field}>
              <strong>Age:</strong> {submission.age}
            </p>
            <p className={classes.field}>
              <strong>Email:</strong> {submission.email}
            </p>
            <p className={classes.field}>
              <strong>Gender:</strong> {submission.gender}
            </p>
            <p className={classes.field}>
              <strong>Terms Accepted:</strong> {submission.acceptedTerms ? 'Yes' : 'No'}
            </p>
            <p className={classes.message}>
              <strong>Message:</strong> {submission.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
