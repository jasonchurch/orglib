var _ = require("lodash");
var Promise = require("bluebird");
var fs = require("fs");

/**
 * writeHeadingsToFile
 * @desc writes a list of headings to a file
 * 
 * @param {array} list of orgobjects.Heading
 * @param {string} filename to write Headings to, overwriting if exists
 * @return {promise} a promise object 
 */
function writeHeadingsToFile(headings, filename) {
  var headingStrings = [];
  return new Promise(function(resolve, reject) {
    _.each(headings, function (heading) {
      headingStrings.push(writeHeadingToString(heading));
    });
    fs.writeFile(filename, headingStrings.join("\n"), function (err) {
      if (err) reject(err);
      resolve(1);
    });
  });
}

/**
  * writeHeadingToString
  * @desc writes an orgobject.Heading to a string using  new lines as required
  * 
  * @param {object} an orgobject.Heading object
  * @return {string} the string representation of a Heading, including its body
  */
function writeHeadingToString (heading) {
  var string = "";

  if (heading.level > 0) {
    var headingLine = Array(heading.level + 1).join('*');
    if (heading.todo) headingLine = headingLine + " " + heading.todo;
    if (heading.priority) headingLine = headingLine + " [#" + heading.priority + "]";
    if (heading.headline) headingLine = headingLine + " " + heading.headline;
    if (heading.tags.length > 0) headingLine = headingLine + "\t:" + heading.tags.join(":") + ":";
    string = string + headingLine + "\n";
  }
  string = string + heading.body.join("\n");
  return string;
}

exports.writeHeadingToString = writeHeadingToString;
exports.writeHeadingsToFile = writeHeadingsToFile;
