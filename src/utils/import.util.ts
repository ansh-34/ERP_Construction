export interface ValidationRule {
  required: boolean;
  validator?: (value: string) => boolean | Promise<boolean>;
  requiredMessage?: string;
  invalidMessage?: string;
}

export const validateRow = (
  row: any,
  rules: Record<string, ValidationRule>,
) => {
  const errors: string[] = [];

  for (const key in rules) {
    const rule = rules[key];
    const value = row[key];

    if (rule.required && !value) {
      errors.push(rule.requiredMessage || `${key} is required`);
    } else if (rule.validator && value && !rule.validator(value)) {
      errors.push(rule.invalidMessage || `${key} is invalid`);
    }
  }

  return errors;
};
