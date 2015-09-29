### Purpose

This NPM module will record all your routes.


### Requirements

To use this module you need tests. The recorder will record all requests and responses of your tests.


### Usage

```
  var expressdocu = require('express-docu');
  
  app.use(function(req, res, next) {
    res.once('finish', function() {
      expressdocu.record({
        req: req,
        res: res,
        headers: yourCustomHeaders
      });
    });

    next();
  });
```


### Example