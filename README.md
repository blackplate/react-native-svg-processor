# Not Ready for public use yet. Complete Rush Job.

- Needs to be converted to typescript
- User should be able to supply a input and output path
- Not sure if the custom template is even still required
- Needs some tests / docs
- Need to fix the ordering, has race conditions - will sometimes output the index before processing the files so you have to run it twice

```
const path = require('path');
const {process} = require('./index');

const source = path.join(__dirname, 'svg');
const output = path.join(__dirname, 'output');

process(source, output);
```
