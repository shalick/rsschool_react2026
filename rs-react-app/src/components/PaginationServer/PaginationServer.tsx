import { Link } from '../../i18n/navigation';
import { buildQueryString } from '../../lib/searchParams';
import classes from '../Pagination/Pagination.module.css';

interface PaginationServerProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  search: string;
}

function pageHref(basePath: string, search: string, page: number): string {
  return `${basePath}${buildQueryString(search, page)}`;
}

export function PaginationServer({
  currentPage,
  totalPages,
  basePath,
  search,
}: PaginationServerProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={classes.paginationContainer} aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, search, currentPage - 1)}
          className={classes.pageButton}
        >
          &laquo; Prev
        </Link>
      ) : (
        <span className={`${classes.pageButton}`} aria-disabled="true">
          &laquo; Prev
        </span>
      )}

      {pageNumbers.map((number) => (
        <Link
          key={number}
          href={pageHref(basePath, search, number)}
          className={`${classes.pageButton} ${currentPage === number ? classes.active : ''}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, search, currentPage + 1)}
          className={classes.pageButton}
        >
          Next &raquo;
        </Link>
      ) : (
        <span className={classes.pageButton} aria-disabled="true">
          Next &raquo;
        </span>
      )}
    </nav>
  );
}
