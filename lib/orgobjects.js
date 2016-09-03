var orgparsers = require("./orgparsers.js");

/**
 * Heading
 *
 * @desc Represent an Org heading
 *
 * Content passed via the constructor should include the headline and body that make up any given Org
 * heading.  Sub headings content shouldn't be included.
 *
 * @param {array}     lines        - raw headline + body content as a list of lines
 * @property {string} headlineText - the text in headline without any meta data
 * @property {array}  tags         - a list of tags
 * @property {number} level        - heading level (1..n, 0 is reserved for root)
 * @property {string} priority     - heading priority A,B,C or null for default
 * @property {object} drawers      - map of drawers in this heading: key = drawer name, value = content
 * @property {array}  body         - the body of the heading as a list of strings
 */
function Heading (lines) {
  if (lines === undefined || lines === null || lines.length === 0) {
    this.level = null;
    this.priority = null;
    this.todo = null;
    this.headline = null;
    this.body = []; 
    this.tags = [];
    this.drawers = {};
  } else {
    var heading = orgparsers.parseHeading(lines);
    this.level = heading.level;
    this.priority = heading.priority;
    this.todo = heading.todo;
    this.headline = heading.headline;
    this.body = heading.body;
    this.tags = heading.tags;
    this.drawers = heading.drawers;    
  }
}

module.exports.Heading = Heading;
