Luhn algorithm
--------------

[![Bower](https://img.shields.io/bower/v/ng-luhn.svg?style=flat-square)]()

**AngularJS service exposing the fastest implementation of [Luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm)**.

Usefult to check check credit card numbers validity or generally to verify card numbers generated via this algorithm.

Closurized, less than 500 bytes.

Instructions
------------

The `luhn` service is a constructor with only a (privileged) method (i.e., `check()`).

Using it is very simple.

1. Load AngularJS and this little library

    ```html
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
    <script src="https://cdn.rawgit.com/leodido/ng-luhn/master/luhn.min.js"></script>
    ```

2. Declare your AngularJS application with `leodido.luhn` in the dependencies array

    ```javascript
    var app = angular.module('myModule', ['leodido.luhn']);
    ````

3. Inject the service into you AngularJS code and call its `check` method

    ```javascript
    app.controller('NumberController', ['luhn', function(luhn) {
      var isValid = luhn.check('49927398716'); 
    }]);
    ```

#### NOTE

Do not forget to bootstrap your AngularJS application ...

Install
-------

Install it via `bower`.

```
bower install ng-luhn
```

Otherwise you can grab `*.luhn.js` file/s in the repository root or use rawgit.

References
-------

* Fastest? Yes, check yourself: [jsperf](https://jsperf.com/credit-card-validator/19).

---

[![Analytics](https://ga-beacon.appspot.com/UA-49657176-1/ng-luhn)](https://github.com/igrigorik/ga-beacon)
