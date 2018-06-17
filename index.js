(function(){

    let moment = require('moment');

    let generateId = require('time-uuid');

    let timestamp = require('./lib/timestamp');

    let logger = require('logger_async');

    let errorResponse = require("errorresponse_async")();

    let successResponse = require("successresponse_async")();

    module.exports.log = (message, tags, config) => {
        return logger.consoleMessage(message, tags, config);
    };

    module.exports.createResponseObj = (responseObj, errorDescriptor, successDescriptor) => {
        let response = (!responseObj || typeof responseObj != "object") ? { "status": 400, "responseData": { "message": "NO RESPONSE" }} : responseObj;
        if(typeof response.status != "number") response = { "status": 200, "responseData": { "message": "No message", "response": response }}

        let errorCode = (typeof errorResponse[errorDescriptor] == "undefined") ? "ERR100" : errorDescriptor;
        let sucessCode = (typeof successResponse[successDescriptor] == "undefined") ? "SUCC100" : successDescriptor;

        let successMessage = (typeof successResponse[successDescriptor] == "undefined") ? successDescriptor: successResponse[successDescriptor];
        let errorMessage = (typeof errorResponse[errorDescriptor] == "undefined") ? errorDescriptor : errorResponse[errorDescriptor];

        if(typeof response.responseData != "object") response.responseData = {};
        if(response.status < 300 && successDescriptor){
            response.responseData.message = successMessage;
            response.responseData.sucessCode = sucessCode;
        }

        if(response.status >= 300 && errorDescriptor){
            response.responseData.message = errorMessage;
            response.responseData.errorCode = errorCode;
        }

        return response;
    };

    module.exports.wasFailure = (responseObj, errorDescriptor) => {
        let errorObj = (!responseObj || typeof responseObj != "object") ? {} : responseObj;
        let message = (typeof errorResponse[errorDescriptor] == "undefined") ? errorDescriptor : errorResponse[errorDescriptor];
        let errorCode = (typeof errorResponse[errorDescriptor] == "undefined") ? "ERR100" : errorDescriptor;

        let response = (typeof errorObj.status != "number") ? { "status": 400, "responseData": { "message": message, "response": errorObj }} : errorObj;
        if(typeof response.responseData != "object") response.responseData = {};
        if (errorDescriptor){
            response.responseData.message = message;
            response.responseData.errorCode = errorCode;
        }
        return response;
    };

    module.exports.wasSuccess = (responseObj, successDescriptor) => {
        let successObj = (!responseObj || typeof responseObj != "object") ? {} : responseObj;
        let message = (typeof successResponse[successDescriptor] == "undefined") ? successDescriptor : successResponse[successDescriptor];
        let sucessCode = (typeof successResponse[successDescriptor] == "undefined") ? "SUCC100" : successDescriptor;

        let response = (typeof successObj.status != "number") ? { "status": 200, "responseData": { "message": message, "response": successObj }} : successObj;
        if(typeof response.responseData != "object") response.responseData = {};
        if (successDescriptor){
            response.responseData.message = message;
            response.responseData.sucessCode = sucessCode;
        }
        return response;
    };

    module.exports.getToken = () => {
        return generateId();
    };

    module.exports.getFormattedDate = (date, format) => {
        let form = (typeof format == "string")? format : 'MM/DD/YYYY';
        let dated = (!date)? moment.utc().format():date;
        return moment.utc(dated).format(form);
    };

    module.exports.getUTCTime = (date) => {
        return moment.utc(date).format();
    };

    module.exports.getDateInTime = (date) => {
        return moment.utc(date).valueOf();
    };

    module.exports.getUTCEndTime = (date) => {
        if(!date) date = moment.utc().format();
        let eod = moment.utc(date).hours(23).minutes(59).seconds(59);
        return eod.format();
    };

    module.exports.getUTCDateDiff = (startDate, endDate, format) => {
        startDate = (!startDate)? moment.utc() : moment.utc(startDate);
        endDate = (!endDate)? moment.utc() : moment.utc(endDate);
        if(!format) format = 'days';

        let startMonth = (parseInt(startDate.format("M")) - 1);
        let endMonth = (parseInt(endDate.format("M")) - 1);

        let lowValue = moment([startDate.format("YYYY"), startMonth, startDate.format("D")]);
        let highValue = moment([endDate.format("YYYY"), endMonth, endDate.format("D")]);
        return highValue.diff(lowValue, format);
    };

    let recursiveUpdate = module.exports.recursiveUpdate = (requestObj, resultObj) => {
        let keyObjUpdate = function(oldObj, key, value){
            oldObj[key] = value;
        };

        let modifyThisObj = (typeof resultObj == "undefined") ? {} : resultObj;
        for(let key in requestObj){
            let definedObj = (typeof modifyThisObj[key] == "undefined") ? {} : modifyThisObj[key];
            if(typeof requestObj[key] == "object") recursiveUpdate(requestObj[key], definedObj);
            keyObjUpdate(modifyThisObj, key, requestObj[key]);
        }
        return modifyThisObj;
    };

    module.exports.timestamp = function(schema, options){
        return timestamp(schema, options);
    };
})();