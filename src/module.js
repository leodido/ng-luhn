'use strict';

goog.provide('leodido.module.Luhn');

goog.require('leodido.service.Luhn');

angular
    .module(leodido.constant.Luhn.MODULE_NAME, [])
    .service(leodido.constant.Luhn.SERVICE_NAME, leodido.service.Luhn);
