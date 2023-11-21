# eslint-web
Browser friendly ESLint

```js
import * as eslint from "@valuabletouch/eslint-browser";

// or const eslint = require("@valuabletouch/eslint-browser");
// or <script src="https://cdn.jsdelivr.net/npm/@valuabletouch/eslint-browser/eslint.js"></script>

const linter = new eslint.Linter();

const messages = linter.verify("var foo;", {
    rules: {
        semi: 2
    }
}, { filename: "foo.js" });
```

https://eslint.org/docs/developer-guide/nodejs-api#linter
