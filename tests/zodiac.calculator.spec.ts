import { ZodiacCalculator } from '../src/profile/utils/zodiac.calculator';

describe('ZodiacCalculator', () => {
  it('should return Rat for 1900, 1912, 1924, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1900)).toBe('Rat');
    expect(ZodiacCalculator.getZodiac(1912)).toBe('Rat');
    expect(ZodiacCalculator.getZodiac(1924)).toBe('Rat');
    expect(ZodiacCalculator.getZodiac(2020)).toBe('Rat');
  });

  it('should return Ox for 1901, 1913, 1925, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1901)).toBe('Ox');
    expect(ZodiacCalculator.getZodiac(1913)).toBe('Ox');
    expect(ZodiacCalculator.getZodiac(1925)).toBe('Ox');
    expect(ZodiacCalculator.getZodiac(2021)).toBe('Ox');
  });

  it('should return Tiger for 1902, 1914, 1926, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1902)).toBe('Tiger');
    expect(ZodiacCalculator.getZodiac(1914)).toBe('Tiger');
    expect(ZodiacCalculator.getZodiac(1926)).toBe('Tiger');
    expect(ZodiacCalculator.getZodiac(2022)).toBe('Tiger');
  });

  it('should return Rabbit for 1903, 1915, 1927, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1903)).toBe('Rabbit');
    expect(ZodiacCalculator.getZodiac(1915)).toBe('Rabbit');
    expect(ZodiacCalculator.getZodiac(1927)).toBe('Rabbit');
    expect(ZodiacCalculator.getZodiac(2023)).toBe('Rabbit');
  });

  it('should return Dragon for 1904, 1916, 1928, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1904)).toBe('Dragon');
    expect(ZodiacCalculator.getZodiac(1916)).toBe('Dragon');
    expect(ZodiacCalculator.getZodiac(1928)).toBe('Dragon');
    expect(ZodiacCalculator.getZodiac(2024)).toBe('Dragon');
  });

  it('should return Snake for 1905, 1917, 1929, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1905)).toBe('Snake');
    expect(ZodiacCalculator.getZodiac(1917)).toBe('Snake');
    expect(ZodiacCalculator.getZodiac(1929)).toBe('Snake');
    expect(ZodiacCalculator.getZodiac(2025)).toBe('Snake');
  });

  it('should return Horse for 1906, 1918, 1930, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1906)).toBe('Horse');
    expect(ZodiacCalculator.getZodiac(1918)).toBe('Horse');
    expect(ZodiacCalculator.getZodiac(1930)).toBe('Horse');
    expect(ZodiacCalculator.getZodiac(2026)).toBe('Horse');
  });

  it('should return Goat for 1907, 1919, 1931, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1907)).toBe('Goat');
    expect(ZodiacCalculator.getZodiac(1919)).toBe('Goat');
    expect(ZodiacCalculator.getZodiac(1931)).toBe('Goat');
    expect(ZodiacCalculator.getZodiac(2027)).toBe('Goat');
  });

  it('should return Monkey for 1908, 1920, 1932, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1908)).toBe('Monkey');
    expect(ZodiacCalculator.getZodiac(1920)).toBe('Monkey');
    expect(ZodiacCalculator.getZodiac(1932)).toBe('Monkey');
    expect(ZodiacCalculator.getZodiac(2028)).toBe('Monkey');
  });

  it('should return Rooster for 1909, 1921, 1933, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1909)).toBe('Rooster');
    expect(ZodiacCalculator.getZodiac(1921)).toBe('Rooster');
    expect(ZodiacCalculator.getZodiac(1933)).toBe('Rooster');
    expect(ZodiacCalculator.getZodiac(2029)).toBe('Rooster');
  });

  it('should return Dog for 1910, 1922, 1934, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1910)).toBe('Dog');
    expect(ZodiacCalculator.getZodiac(1922)).toBe('Dog');
    expect(ZodiacCalculator.getZodiac(1934)).toBe('Dog');
    expect(ZodiacCalculator.getZodiac(2030)).toBe('Dog');
  });

  it('should return Pig for 1911, 1923, 1935, etc.', () => {
    expect(ZodiacCalculator.getZodiac(1911)).toBe('Pig');
    expect(ZodiacCalculator.getZodiac(1923)).toBe('Pig');
    expect(ZodiacCalculator.getZodiac(1935)).toBe('Pig');
    expect(ZodiacCalculator.getZodiac(2031)).toBe('Pig');
  });
});
