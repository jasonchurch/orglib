var _ = require("lodash");
var orgobjects = require("./orgobjects.js");

/** 
 * ORG_REGEX_HEADLINE_META GROUPING 0=all, 1=level, 2=todo, 3=priority, 4=headline, 5=tags.  Blank = no match
 */
var ORG_REGEX_HEADLINE_META = /^(\*+) (?:(TODO|NEXT|DONE) )?(?:\[#(A|B|C)\] )?(.*?)(?:\s*(\:[^:]+\:(?:[^:]+\:)?))?$/;

var ORG_REGEX_HEADLINE = /^\*+ .*$/;
var ORG_DRAWER_START = /^\s*:((?!END).*):$/;
var ORG_DRAWER_END = /^\s*:END:$/;

/**
 * convertTagsStringToArray
 *
 * @desc converts a tag string into a list of tags
 *
 * @param {tagString} a string containing a list of tags using the org tag format: ':tag1:tag2:'
 * @return {array} a list of tags
 */
function parseTags(tagString) {
  var tags = [];
  tags = tagString.slice(1).slice(0,-1).split(/:/);
  return tags;
}


/**
 * parseHeading
 *
 * @desc It parses an array of text, repesenting a single org heading & body, into a map representing that heading.
 *
 * @param {array} lines - the lines that make up the org heading and body; it should only include the heading & body, but not subheadings
 * @return {object} a map representing the key proprties that make up a heading and its body
 */
function parseHeading(lines) {  
  var headlineResult = parseHeadline(lines[0]);

  if (headlineResult) {
    var body = lines.slice(1);
    return  {
      level: headlineResult.level,
      todo: headlineResult.todo,
      priority: headlineResult.priority,
      headline: headlineResult.headline,
      tags: headlineResult.tags,
      drawers: parseDrawers(body),
      body: body
    };
  } else {
    return {
      level: 0,
      todo: undefined,
      priority: undefined,
      headline: undefined,
      tags: [],
      drawers: {},
      body: lines
    };
  }
};


/**
 * parseHeadline
 *
 * @desc It parses a single line representing an org heading, no body, into a map representing the properties that make up a Heading
 * This differs from parseHeading in that it only parses the Org heading line; therefore, it has no body or drawer properties.
 *
 * @param {String} line - the org heading to be parsed; body should not be included
 * @return {object} a map representing the key proprties that make up a heading
 */
function parseHeadline(line) {
  var match = line.match(ORG_REGEX_HEADLINE_META);
  if (match) {
    var result = {};
    result.level = match[1].length;
    result.todo = match[2];
    result.priority = match[3];
    result.headline = match[4];
    result.tags = match[5] ? parseTags(match[5]) : [];
    return result;
  } else {
    return null;
  }
};


/**
 * parseContents
 *
 * @desc It parses Org content into a list of OrgHeadlines.
 *
 * @param {string} contents - the org contents to parse
 * @return {array} a list of {OrgHeadline}.
 */
function parseContents(contents) {
  var lines = contents.toString().replace(/\r\n/g, '\n').split(/\n/);
  var headings = [];
  var headingLines = [];
  _.each(lines, function(line) {
    if (ORG_REGEX_HEADLINE.test(line)) {
      if (headingLines.length > 0) { //createHeading for previous heading and reset headingLines for this new heading
	headings.push(new orgobjects.Heading(headingLines));
	headingLines = [];
      }
    }
    headingLines.push(line); //capture lines that make up this heading
  });
  if (headingLines.length > 0) { //createHeading from the last headingLines
    headings.push(new orgobjects.Heading(headingLines));
  }
  return headings;
}

/**
 * parseDrawers 
 *
 * @desc parses all the drawers from an Org Headline
 *
 * @param {array} orgHeadlineBody a Heading Body
 * @param {boolean} remove delete parsed elements in orgHeadlineBody
 * @return {object} a map of the parsed drawers where key is drawer name and value the drawer content
 */
function parseDrawers(orgHeadlineBody, remove) {
  remove = remove | false;
  var drawerlines = [];
  var foundDrawer = false;
  var drawers = {};
  var drawerName;
  _.each(orgHeadlineBody, function(line, index, collection) {
    if (line.match(ORG_DRAWER_START)) {
      drawerName = line.match(ORG_DRAWER_START)[1];
      foundDrawer = true;
      if (remove) delete collection[index];
    } else if (line.match(ORG_DRAWER_END)) {
      foundDrawer = false;
      drawers[drawerName] = drawerlines;
      drawerlines = [];
      if (remove) delete collection[index];
    } else {
      if (foundDrawer) {
	drawerlines.push(line);
	if (remove) delete collection[index];
      }
    }	
  });
  return drawers;
};


module.exports.parseHeadline = parseHeadline;
module.exports.parseHeading = parseHeading;
module.exports.parseDrawers = parseDrawers;
module.exports.parseContents = parseContents;

