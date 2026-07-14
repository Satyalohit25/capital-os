# Python Quality Control Sub-Skill

This sub-skill documents Python environment validation, dependency management, and type checking principles.

## 1. Virtual Environment Validation
*   **Best Practice**: Ensure a virtual environment (e.g. `.venv`, `venv`, or conda) is active to prevent polluting global packages.
*   **Check Command**:
    ```bash
    python -c "import sys; print(sys.prefix != sys.base_prefix)"
    # Returns True if running inside a virtual environment.
    ```

## 2. Dependency Resolution
*   **Best Practice**: Ensure dependencies are locked and match the schema in the manifest file (`pyproject.toml`, `requirements.txt`, `Pipfile`, or `poetry.lock`).
*   **Verification**:
    *   Verify package installation and imports before run:
        ```bash
        pip check
        ```
    *   Generate clean dependency logs using `pip freeze > requirements.txt` or updating locks with `poetry lock`.

## 3. Formatting & Linting
*   Use standard tools to verify Python syntax and formatting:
    *   **Format**: Run `black .` or `ruff format .` to format the workspace automatically.
    *   **Lint**: Run `flake8` or `ruff check .` to check for unused imports, undefined variables, and styling issues.
    *   **Types**: Run `mypy .` to verify type safety and type check parameters.
