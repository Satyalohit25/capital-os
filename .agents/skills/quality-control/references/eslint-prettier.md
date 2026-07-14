# ESLint & Prettier Quality Control Sub-Skill

This sub-skill documents common errors, solutions, and quality verification standards when using ESLint and Prettier.

## 1. Prettier Line Endings Warning (CRLF vs LF)
*   **Symptom**: ESLint outputs hundreds or thousands of errors saying `Delete ␍ prettier/prettier`.
*   **Cause**: On Windows systems, files are often saved with CRLF (`\r\n`) line endings, while Prettier is configured to expect LF (`\n`) line endings.
*   **Remedy**:
    1.  Run the code formatter:
        ```bash
        npm run format  # or bun run format / yarn format
        ```
    2.  If the project doesn't have a format script, configure `.prettierrc` to auto-detect line endings:
        ```json
        {
          "endOfLine": "auto"
        }
        ```

## 2. Fast Refresh only-export-components Warnings
*   **Symptom**: Linter warning `Fast refresh only works when a file only exports components...`.
*   **Cause**: React components and static config objects or utility helper functions are exported from the same component file.
*   **Remedy**: Move the constants or helpers into a separate file (e.g., in a `utils/` or `lib/` directory) and import them, or if safe, disable the rule inline.

## 3. Dealing with Dynamic `any` Type Casts
*   **Symptom**: `@typescript-eslint/no-explicit-any` errors in generic store actions or generic components.
*   **Remedy**: Try to use `unknown` or generic parameters (`T[keyof T]`). If dynamic type casting is required due to library limitations (e.g. Zustand dynamic middleware or generalized CRUD helpers), add a clean file-level override at the top of the file:
    ```typescript
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ```
