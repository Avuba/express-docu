### Purpose

This NPM module will record all your routes.


### Requirements

To use this module you need tests. The recorder will record all requests and responses of your tests.


### Usage

```
  var expressdocu = require('express-docu');
  app.use(expressDocu.record);
  
  // run your tests and execute
  node node_modules/express-docu/generateDocs.js
```

### TODO:
- cleanup recorded files
- cleanup output


### Example