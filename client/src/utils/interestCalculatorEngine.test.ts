import { calculateInterest, formatINR, isLeapYear } from './interestCalculatorEngine';

/**
 * Self-verification test suite for Interest Calculator Engine
 */
export const runInterestCalculatorEngineTests = (): boolean => {
  // Test 1: Simple Interest
  const simpleRes = calculateInterest({
    principal: 100000,
    rate: 10,
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    calculationType: 'SIMPLE',
    dayCountConvention: 'ACTUAL_365'
  });

  if (!simpleRes.valid || simpleRes.interestEarned !== 10000 || simpleRes.totalAmount !== 110000) {
    console.error('Simple Interest engine verification failed:', simpleRes);
    return false;
  }

  // Test 2: Compound Interest Monthly
  const compoundRes = calculateInterest({
    principal: 100000,
    rate: 12,
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    calculationType: 'COMPOUND',
    compoundingFrequency: 'MONTHLY',
    dayCountConvention: 'ACTUAL_365'
  });

  if (!compoundRes.valid || compoundRes.totalAmount < 112600 || compoundRes.totalAmount > 113000) {
    console.error('Compound Interest engine verification failed:', compoundRes);
    return false;
  }

  // Test 3: Leap year
  if (!isLeapYear(2024) || isLeapYear(2025)) {
    console.error('Leap year verification failed');
    return false;
  }

  // Test 4: Format INR
  if (!formatINR(100000).includes('1,00,000')) {
    console.error('INR formatting verification failed');
    return false;
  }

  return true;
};
