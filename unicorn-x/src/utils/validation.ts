interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];
  
  // Required environment variables
  const required = [
    'NOTION_TOKEN',
    'GOOGLE_API_KEY'
  ];
  
  // Optional but recommended
  const recommended = [
    'PORT',
    'HOST',
    'NODE_ENV',
    'CORS_ORIGIN'
  ];
  
  // Check required variables
  for (const variable of required) {
    if (!process.env[variable]) {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  }
  
  // Warn about recommended variables
  for (const variable of recommended) {
    if (!process.env[variable]) {
      console.warn(`⚠️  Missing recommended environment variable: ${variable}`);
    }
  }
  
  // Validate specific formats
  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    errors.push('PORT must be a valid number');
  }
  
  if (process.env.NOTION_TOKEN && !process.env.NOTION_TOKEN.startsWith('secret_')) {
    console.warn('⚠️  NOTION_TOKEN should start with "secret_"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default validateEnvironment;
