describe("parsers", function () {
  var orgparsers = require("../lib/orgparsers.js");
  var fs = require("fs");
  var _ = require("lodash");
  
  describe("parseHeadline", function() {
    var headingTodoPriorityTags;
    var headingPriorityTags;
    var headingTodoTags;
    var headingTodoPriority;
    var headingPriority;
    var headingTodo;
    var headingTags;
    
    beforeEach(function() {
      headingTodoPriorityTags = "*** NEXT [#B] Test Headline :tag1:tag2:";
      headingPriorityTags = "*** [#B] Test Headline :tag1:tag2:";
      headingTodoTags = "*** NEXT Test Headline :tag1:tag2:";
      headingTodoPriority = "*** NEXT [#B] Test Headline";
      headingPriority = "*** [#B] Test Headline";
      headingTodo = "*** NEXT Test Headline";
      headingTags = "*** Test Headline :tag1:tag2:";
    });

    it("should parse headingTodoPriorityTags", function() {
      expect(orgparsers.parseHeadline(headingTodoPriorityTags))
	.toEqual({
	  level: 3,
	  todo: "NEXT",
	  priority: "B",
	  tags: ["tag1", "tag2"],
	  headline: "Test Headline"
	});
    });
    it("should parse headingPriorityTags", function() {
      expect(orgparsers.parseHeadline(headingPriorityTags))
	.toEqual({
	  level: 3,
	  todo: undefined,
	  priority: "B",
	  tags: ["tag1", "tag2"],
	  headline: "Test Headline"
	});
    });
    it("should parse headingTodoTags", function() {
      expect(orgparsers.parseHeadline(headingTodoTags))
	.toEqual({
	  level: 3,
	  todo: "NEXT",
	  priority: undefined,
	  tags: ["tag1", "tag2"],
	  headline: "Test Headline"
	});
    });
    it("should parse headingTodoPriority", function() {
      expect(orgparsers.parseHeadline(headingTodoPriority))
	.toEqual({
	  level: 3,
	  todo: "NEXT",
	  priority: "B",
	  tags: [],
	  headline: "Test Headline"
	});
    });
    it("should parse headingPriority", function() {
      expect(orgparsers.parseHeadline(headingPriority))
	.toEqual({
	  level: 3,
	  todo: undefined,
	  priority: "B",
	  tags: [],
	  headline: "Test Headline"
	});
    });
    it("should parse headingTodo", function() {
      expect(orgparsers.parseHeadline(headingTodo))
	.toEqual({
	  level: 3,
	  todo: "NEXT",
	  priority: undefined,
	  tags: [],
	  headline: "Test Headline"
	});
    });
    it("should parse headingTags", function() {
      expect(orgparsers.parseHeadline(headingTags))
	.toEqual({
	  level: 3,
	  todo: undefined,
	  priority: undefined,
	  tags: ["tag1","tag2"],
	  headline: "Test Headline"
	});
    });
    
  });
  describe("parseHeading", function() {
    var headingLinesTodoPriorityTags;
    var headingLinesOnlyHeadline;
    beforeEach(function() {
      headingLinesTodoPriorityTags = [
	"*** NEXT [#B] Example level 2 heading with TODO, PRIOIRTY and Tags :tag1:tag2:",
	":PROPERTIES:",
	":prop1: one",
	":prop2: two",
	":END:",
	"The first line of the body",
	"The second line of the body"
      ];
      headingLinesOnlyHeadline = ["*** Example level 2 heading with TODO, PRIOIRTY and Tags"];
    });
    it("should parse a list of lines into a heading", function() {
      expect(orgparsers.parseHeading(headingLinesTodoPriorityTags))
	.toEqual({
	  level: 3,
	  todo: "NEXT",
	  priority: "B",
	  headline: "Example level 2 heading with TODO, PRIOIRTY and Tags",
	  tags: ["tag1", "tag2"],
	  drawers: {PROPERTIES : [ ':prop1: one', ':prop2: two' ]},
	  body: [
	    ":PROPERTIES:",
	    ":prop1: one",
	    ":prop2: two",
	    ":END:",
	    "The first line of the body",
	    "The second line of the body"
	  ]
	});
    });
    it("should parse only a headline with no meta or body", function() {
      expect(orgparsers.parseHeading(headingLinesOnlyHeadline))
	.toEqual({
	  level: 3,
	  todo: undefined,
	  priority: undefined,
	  headline: "Example level 2 heading with TODO, PRIOIRTY and Tags",
	  tags: [],
	  drawers: {},
	  body: []
	});
    });
  });

  describe("parseDrawer", function() {
    var headingBodyWithProperties;
    var headingBodyWithPropertiesAndLogbook;    
    beforeEach(function() {
      headingBodyWithProperties = [
	"\t:PROPERTIES:",
	"\t:date:2016-01-21 12:32:32",
	"\t:prop2:some property",
	"\t:END:",
	"Some other body lines of text",
	"that makes up the body"
      ];
      headingBodyWithPropertiesAndLogbook = [
	"   :LOGBOOK:",
	"   - Note taken on [2016-08-21 Sun 23:41] \\",
	"     This is a test.",
	"     A test is now",
	"   :END:",
	"\t:PROPERTIES:",
	"\t:date:2016-01-21 12:32:32",
	"\t:prop2:some property",
	"\t:END:",
	"Some other body lines of text",
	"that makes up the body"	
      ];
    });
    it("should return a map of drawers with key as drawer name and value as content lines", function() {
      expect(orgparsers.parseDrawers(headingBodyWithPropertiesAndLogbook))
	.toEqual({
	  "PROPERTIES": [
	    "\t:date:2016-01-21 12:32:32",
	    "\t:prop2:some property"
	  ],
	  "LOGBOOK": [
	    "   - Note taken on [2016-08-21 Sun 23:41] \\",
	    "     This is a test.",
	    "     A test is now",	    
	  ]
	});
    });
    it("should remove the drawer lines from body if remove=true", function() {
      orgparsers.parseDrawers(headingBodyWithProperties, true);
      expect(headingBodyWithProperties)
	.toEqual([
	  undefined,
	  undefined,
	  undefined,
	  undefined,
	  "Some other body lines of text",
	  "that makes up the body"
	]);
    });  
  });

  describe("parseContents", function() {
    var orgcontent = null;
    beforeEach(function() {
      orgcontent = fs.readFileSync("./spec/parseOrgContentsTest1.org");
    });
    it("should return a list of orgobjects.Headings", function() {
      var expected = [
	  {level: 1, priority: "A", todo: "NEXT", headline: "A Level 1 Heading",
	   body: ["some text belonging to the level 1", ""],
	   tags: [], drawers: {}
	  },
	  {level: 2, priority: undefined, todo: "DONE", headline: "A Level 2 Heading",
	   body: ["some text belonging to the level 2", ""],
	   tags: ["tag2"], drawers: {}
	  }	  
	  
      ];
      var headings = orgparsers.parseContents(orgcontent);
       expect(headings).toEqual(expected);
    });
  });
});
