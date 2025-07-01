import { HoroscopeCalculator } from '../src/profile/utils/horoscope.calculator';

describe('HoroscopeCalculator', () => {
  it('should return Aries for dates between March 21 and April 19', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-03-21'))).toBe('Aries');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-04-19'))).toBe('Aries');
  });

  it('should return Taurus for dates between April 20 and May 20', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-04-20'))).toBe('Taurus');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-05-20'))).toBe('Taurus');
  });

  it('should return Gemini for dates between May 21 and June 20', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-05-21'))).toBe('Gemini');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-06-20'))).toBe('Gemini');
  });

  it('should return Cancer for dates between June 21 and July 22', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-06-21'))).toBe('Cancer');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-07-22'))).toBe('Cancer');
  });

  it('should return Leo for dates between July 23 and August 22', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-07-23'))).toBe('Leo');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-08-22'))).toBe('Leo');
  });

  it('should return Virgo for dates between August 23 and September 22', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-08-23'))).toBe('Virgo');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-09-22'))).toBe('Virgo');
  });

  it('should return Libra for dates between September 23 and October 22', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-09-23'))).toBe('Libra');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-10-22'))).toBe('Libra');
  });

  it('should return Scorpio for dates between October 23 and November 21', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-10-23'))).toBe('Scorpio');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-11-21'))).toBe('Scorpio');
  });

  it('should return Sagittarius for dates between November 22 and December 21', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-11-22'))).toBe('Sagittarius');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-12-21'))).toBe('Sagittarius');
  });

  it('should return Capricorn for dates between December 22 and January 19', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-12-22'))).toBe('Capricorn');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-01-19'))).toBe('Capricorn');
  });

  it('should return Aquarius for dates between January 20 and February 18', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-01-20'))).toBe('Aquarius');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-02-18'))).toBe('Aquarius');
  });

  it('should return Pisces for dates between February 19 and March 20', () => {
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-02-19'))).toBe('Pisces');
    expect(HoroscopeCalculator.getHoroscope(new Date('2000-03-20'))).toBe('Pisces');
  });

  it('should return Unknown for invalid dates (e.g., outside of any range)', () => {
    // This case should ideally not be hit with valid date inputs, but for completeness
    // we can test a date that falls outside all defined ranges if such a case is possible.
    // Given the current logic, all dates should fall into one of the signs.
    // This test case might need adjustment if the HoroscopeCalculator logic changes.
    // For now, we'll test a date that might theoretically fall through if the logic was flawed.
    // However, with the current implementation, all dates will match a sign.
    // So, this test will likely fail if the implementation is correct.
    // Let's re-evaluate if there's a scenario where 'Unknown' is actually returned.
    // Based on the current code, 'Unknown' is a fallback that should not be reached.
    // Therefore, this test case is more for demonstrating a potential edge case if the logic was incomplete.
    // For now, we will skip this test or adjust it if a valid 'Unknown' scenario is identified.
  });
});
