import { useNavigate } from 'react-router-dom';
import { useSelectionStore } from '../../store/useSelectionStore';
import classes from './CountryCard.module.css';

interface ICountryCard {
  cca3: string;
  name: { common: string; official?: string };
  flags: { png: string; svg: string; alt?: string };
  capital?: string[];
  region: string;
  population: number;
  subregion?: string;
  currentSearch?: string;
}

export const CountryCard = ({
  cca3,
  name,
  flags,
  capital,
  region,
  population,
  currentSearch = '',
}: ICountryCard) => {
  const navigate = useNavigate();
  const { selectedIds, toggleSelection } = useSelectionStore();
  const isSelected = selectedIds.has(cca3);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSelection(cca3);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${cca3.toLowerCase()}${currentSearch}`);
  };

  return (
    <li className={classes.country} onClick={handleCardClick}>
      <div className={classes.checkboxContainer}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
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
