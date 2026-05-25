// import { render, screen } from '@testing-library/react';
// import { CountryCard } from './CountryCard';
// import { describe, expect, it, vi } from 'vitest';

// vi.mock('./CountryCard.module.css', () => ({
//   default: {
//     country: 'country',
//     flag: 'flag',
//     countryInfo: 'countryInfo',
//     details: 'details',
//   },
// }));

// describe('CountryCard', () => {
//   const mockCountry = {
//     name: { common: 'Germany', official: 'Federal Republic of Germany' },
//     flags: {
//       png: 'https://flagcdn.com',
//       svg: 'https://flagcdn.com/de.svg',
//       alt: 'Flag of Germany',
//     },
//     capital: ['Berlin'],
//     region: 'Europe',
//     population: 83200000,
//   };

//   it('renders country name, flag, population, region, and capital', () => {
//     render(<CountryCard {...mockCountry} />);

//     expect(screen.getByText('Germany')).toBeInTheDocument();

//     const flagImg = screen.getByAltText('Flag of Germany');
//     expect(flagImg).toHaveAttribute('src', mockCountry.flags.svg);

//     expect(screen.getByText(/Population:/)).toBeInTheDocument();

//     // expect(
//     //   screen.getByText((content) =>
//     //     content.replace(/\s/g, '').includes('83200000')
//     //   )
//     // ).toBeInTheDocument();

//     expect(
//       screen.getByText((content) =>
//         content.replace(/\D/g, '').includes('83200000')
//       )
//     ).toBeInTheDocument();

//     expect(screen.getByText(/Region:/)).toBeInTheDocument();
//     expect(screen.getByText('Europe')).toBeInTheDocument();

//     expect(screen.getByText(/Capital:/)).toBeInTheDocument();
//     expect(screen.getByText('Berlin')).toBeInTheDocument();
//   });

//   it('uses fallback alt text when flags.alt is missing', () => {
//     const countryWithoutAlt = {
//       ...mockCountry,
//       flags: { ...mockCountry.flags, alt: undefined },
//     };
//     render(<CountryCard {...countryWithoutAlt} />);
//     expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
//   });

//   it('renders correctly when capital array is empty', () => {
//     const countryEmptyCapital = { ...mockCountry, capital: [] };
//     render(<CountryCard {...countryEmptyCapital} />);

//     expect(screen.queryByText('Berlin')).not.toBeInTheDocument();
//     expect(screen.getByText(/Capital:/)).toBeInTheDocument();
//   });

//   it('renders "N/A" for capital when capital is undefined', () => {
//     const countryUndefinedCapital = { ...mockCountry, capital: undefined };
//     render(<CountryCard {...countryUndefinedCapital} />);
//     expect(screen.getByText('N/A')).toBeInTheDocument();
//   });

//   it('formats large population correctly based on current locale', () => {
//     const countryLargePop = { ...mockCountry, population: 1234567890 };
//     render(<CountryCard {...countryLargePop} />);

//     expect(
//       screen.getByText((content) =>
//         content.replace(/\s/g, '').includes('1234567890')
//       )
//     ).toBeInTheDocument();
//   });
// });
