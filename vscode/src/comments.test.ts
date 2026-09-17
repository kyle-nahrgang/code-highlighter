import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLineCommentSyntax, makeMarkerComment } from "./comments";

describe("makeMarkerComment", () => {
  it("uses language-appropriate comment syntax", () => {
    assert.equal(makeMarkerComment(getLineCommentSyntax("typescript"), "!important"), "// !important");
    assert.equal(
      makeMarkerComment(getLineCommentSyntax("python"), "!important", "red"),
      "# !important:red"
    );
    assert.equal(
      makeMarkerComment(getLineCommentSyntax("html"), "!important", "#00f"),
      "<!-- !important:#00f -->"
    );
    assert.equal(makeMarkerComment(getLineCommentSyntax("css"), "!important"), "/* !important */");
  });
});
