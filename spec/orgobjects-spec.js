describe("parsers", function () {
  var orgobjects = require("../lib/orgobjects.js");

  
  describe("Heading", function() {
    it("should provide an empty Heading if no content is passed in", function () {
      expect(new orgobjects.Heading())
	.toEqual({
	  level: null,
	  priority: null,
	  todo: null,
	  headline: null,
	  body: [],
	  tags: [],
	  drawers: {}
	});
    });
  });
});
