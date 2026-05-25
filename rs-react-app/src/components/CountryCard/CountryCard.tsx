import classes from './CountryCard.module.css';
import { useSelectionStore } from '../../store/useSelectionStore';

interface ICountryCard {
  cca3: string;
  name: {
    common: string;
    official?: string;
  };
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  population: number;
  subregion?: string;
  onOpenDetails?: (id: string) => void;
}

export const CountryCard = ({
  cca3,
  name,
  flags,
  capital,
  region,
  population,
  onOpenDetails,
}: ICountryCard) => {
  const { selectedIds, toggleSelection } = useSelectionStore();
  const isSelected = selectedIds.has(cca3);

  const handleCheckboxChange = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    toggleSelection(cca3);
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(cca3);
    }
  };

  return (
    <li className={classes.country} onClick={handleCardClick}>
      <div className={classes.checkboxContainer} onClick={handleCheckboxChange}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <img
        src={flags.svg}
        alt={flags.alt || `Flag of ${name.common}`}
        className={classes.flag}
      />
      <div className={classes.countryInfo}>
        <h3>{name.common}</h3>
        <div className={classes.details}>
          <p>
            <strong>Population:</strong> {population.toLocaleString()}
          </p>
          <p>
            <strong>Region:</strong> {region}
          </p>
          <p>
            <strong>Capital:</strong> {capital ? capital[0] : 'N/A'}
          </p>
        </div>
      </div>
    </li>
  );
};
