import { baseConfig, createConfig } from '@viamrobotics/eslint-config';

export default createConfig(
  baseConfig,
  {
    ignores: ['dist'],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
  },
  {
    files: ['tests/**/*'],
    rules: {
      'no-empty-pattern': 'off',
    },
  }
);
