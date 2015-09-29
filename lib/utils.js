/**
 * User: samz
 * Date: 4/24/14
 * Time: 3:46 PM
 *
 */


exports.isObjectId = function(str) {
  return typeof str === 'string' && str.match(/[0-9a-fA-F]{24}/g)
};

exports.isUUID = function(str) {
  return typeof str === 'string' && str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
};

exports.isDate = function(str) {
  return !isNaN(new Date(str).valueOf());
};

exports.isNumber = function(str) {

  if (typeof str === 'string' && str.match(/[a-zA-Z:\s]+/g))
    return false;
  var isInt = !isNaN(parseInt(str));
  var isFloat = !isNaN(parseFloat(str));
  var isNumType = typeof str === 'number';
  return isNumType || isInt || isFloat;
};

/**
 * naive check for email, just check that:
 *  - it has only one @
 *  - address is made up of valid address chars
 *  - host is made up of valid host chars
 * @param str
 */
exports.isEmail = function(str){
  var atIdx = str.indexOf('@')
  if ( atIdx > 0){
    if (str.indexOf('@', atIdx) > atIdx){
      return false;
    }
    var address = str.substring(0, atIdx);
    var host = str.substring(atIdx + 1);
    if (address.match(/^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]+$/) && host.match(/^[a-zA-Z0-9-.]{3,}$/)){
      return true;
    }
  }
  return false;
};

