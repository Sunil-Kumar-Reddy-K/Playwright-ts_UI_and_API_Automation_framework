import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    languageOptions: {
        parserOptions : {
            project : true,
            tsconfigRootDir : "."
        }
    },
    rules: {
        "@typescript-eslint/no-floating-promises" : "error",
        "@typescript-eslint/await-thenable" : "error",
    },
    
  }
);