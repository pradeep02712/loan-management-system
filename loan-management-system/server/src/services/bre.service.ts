import { EmploymentModes, type EmploymentMode } from '../constants/enums';

export type BreInput = {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
};

export type BreFailure = {
  rule: 'AGE' | 'SALARY' | 'PAN' | 'EMPLOYMENT';
  message: string;
};

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function getAge(dateOfBirth: Date, today = new Date()) {
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  const dayDiff = today.getDate() - dateOfBirth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function runBre(input: BreInput) {
  const failures: BreFailure[] = [];
  const age = getAge(input.dateOfBirth);
  const pan = input.pan.trim().toUpperCase();

  if (age < 23 || age > 50) {
    failures.push({ rule: 'AGE', message: 'Applicant age must be between 23 and 50 years.' });
  }

  if (input.monthlySalary < 25000) {
    failures.push({ rule: 'SALARY', message: 'Monthly salary must be at least ₹25,000.' });
  }

  if (!PAN_REGEX.test(pan)) {
    failures.push({ rule: 'PAN', message: 'PAN must match the format ABCDE1234F.' });
  }

  if (input.employmentMode === EmploymentModes.UNEMPLOYED) {
    failures.push({ rule: 'EMPLOYMENT', message: 'Unemployed applicants are not eligible.' });
  }

  return {
    passed: failures.length === 0,
    age,
    failures
  };
}
