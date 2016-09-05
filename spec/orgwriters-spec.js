describe("orgwriter", function () {
  var rewire = require('rewire');
  var orgwriters = rewire('../lib/orgwriters.js');
  var orgobjects = require('../lib/orgobjects.js');
  var fs = require('fs');
  var heading1;

  beforeEach(function () {
    heading1 = new orgobjects.Heading();
    heading1.level = 2;
    heading1.todo = "NEXT";
    heading1.priority = 'B';
    heading1.headline = "A 2nd level heading";
    heading1.tags.push("tag1");
    heading1.tags.push("tag2");
    heading1.body.push("  This is the first line");
    heading1.body.push("  This is the second line");
  });
  
  describe("writeHeadingToString", function () {
    it("should take a Heading and return a String representation", function () {
      expect(orgwriters.writeHeadingToString(heading1))
	.toEqual([
	  "** NEXT [#B] A 2nd level heading\t:tag1:tag2:",
	  "  This is the first line",
	  "  This is the second line"
	].join("\n"));
    });
  });

  describe("writeHeadingsToFile", function () {
    var mock = require('mock-fs');
    
    var headings = [];
    beforeEach( function() {
      headings = [];
      headings.push(heading1);
      mock({
	'/test.org': mock.file({
	  content: 'some test data that should get overriden',
	  mode: 0666	  
	})
      });      
    });

    afterEach( function() {
      mock.restore();
    });
    
    it("should take a list of headings and write them to a file", function () {
      console.log(headings);
      var promise;
      runs(function() {
    	 promise = orgwriters.writeHeadingsToFile(headings, "/test.org");
      });
      
      waitsFor(function() {
    	return promise.isFulfilled();
      }, "Write file timed out", 1000);
      
      runs(function() {
	var testorg = fs.readFileSync("/test.org");
	expect(testorg.toString())
	  .toEqual([
	    '** NEXT [#B] A 2nd level heading	:tag1:tag2:',
	    '  This is the first line',
	    '  This is the second line'
	  ].join('\n'));
      });
    });
  });
});
