import classes from '../../page-components/HomePage.module.css';

interface SearchResultsLayoutProps {
  left: React.ReactNode;
  details: React.ReactNode;
  hasCountry: boolean;
}

export function SearchResultsLayout({ left, details, hasCountry }: SearchResultsLayoutProps) {
  return (
    <>
      <div className={classes.leftSection} data-panel="list">
        {left}
      </div>
      {hasCountry && (
        <div
          className={classes.rightSection}
          data-panel="details"
          aria-label="Country details panel"
        >
          {details}
        </div>
      )}
    </>
  );
}
