# Circular Dependencies

## 🔄 Why circular dependencies occur

* **Cross-importing modules** that depend on each other (`A imports B` and `B imports A`).
* **Deeply coupled layers** (e.g., models importing services that import models).
* **Re-export barrels** (`index.ts`) that unintentionally re-import the same module.


## ✅ Best Practices to Avoid Circular Dependencies

### 1. **Layered Architecture**

* Organize code into **clear layers** (e.g., `controllers → services → repositories → models`).
* Always **depend downward**, never sideways or upward.
* Example:

  ```
  src/
    controllers/
    services/
    repositories/
    models/
    utils/
  ```
* If a service needs a repository, import it — but don’t let repositories import services.


### 2. **Dependency Inversion / Interfaces**

* Define **interfaces** for shared contracts and keep them in a separate package/module (e.g., `types` or `contracts`).
* Both sides depend on the **abstraction**, not on each other.
* Example:

  ```ts
  // contracts/IMailer.ts
  export interface IMailer {
    send(to: string, message: string): Promise<void>;
  }

  // services/Mailer.ts
  import { IMailer } from "../contracts/IMailer";
  export class Mailer implements IMailer { ... }

  // controllers/UserController.ts
  import { IMailer } from "../contracts/IMailer";
  ```
* This way controllers don’t directly depend on the implementation.


### 3. **Avoid `barrel` files for core modules**

* `index.ts` barrels often hide circular imports.
* Instead of:

  ```ts
  // services/index.ts
  export * from "./UserService";
  export * from "./AuthService";
  ```

  Import services directly where needed:

  ```ts
  import { UserService } from "../services/UserService";
  ```


### 4. **Split into packages or modules**

* For large projects, use **monorepo structure** (e.g., with Nx or Turborepo).
* Each domain has its own **package** with clear boundaries, and only high-level layers import lower ones.


### 5. **Refactor shared logic into utility modules**

* If two modules depend on each other, extract the shared logic into a `utils/` or `common/` module.


### 6. **Lazy / Dynamic Imports (when necessary)**

* If a circular dependency is **unavoidable**, break it using `import()`:

  ```ts
  const { OtherClass } = await import("./OtherClass");
  ```
* This defers loading and avoids circular load at runtime.


## 🛠 Tools to Detect Circular Dependencies

1. **Madge**

   * CLI & Node.js library to detect circular dependencies and visualize module graphs.

   ```bash
   npx madge --circular src/
   ```

   * Can generate a dependency graph (`--image graph.svg`).

2. **depcruise (dependency-cruiser)**

   * More configurable than Madge.

   ```bash
   npx depcruise --include-circular -- src
   ```

   * Lets you enforce rules like “controllers must not import repositories”.

3. **ESLint plugins**

   * `eslint-plugin-import`:

     ```json
     {
       "rules": {
         "import/no-cycle": ["error", { "maxDepth": 1 }]
       }
     }
     ```
   * Helps catch cycles early in CI/CD.

4. **TSConfig project references**

   * With `composite` projects, you enforce **modular separation** — no circulars across project boundaries.


## 🔑 Summary

* **Architect for directionality**: controllers → services → repositories → models.
* **Extract shared contracts** into interfaces / types to break circulars.
* **Avoid barrels** for non-trivial modules.
* **Use tools** like `madge`, `dependency-cruiser`, and `eslint-plugin-import` to detect cycles early.
* **Split into modules/packages** for very large projects.
