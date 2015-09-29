### Purpose

This NPM module will record all your routes and produces a HTML api documentation.


### Requirements

To use this module you need tests. The recorder will record all requests and responses of your tests.
The NPM only works with express.


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
![alt tag](images/1.png =250x)
![alt tag](images/2.png =250x)
![alt tag](images/3.png =250x)
