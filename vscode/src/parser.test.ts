import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findMarkerInLine, parseHighlightRegions } from "./parser";

const options = {
  token: "!important",
  includeMarkers: true,
};

describe("findMarkerInLine", () => {
  it("detects line comments across languages", () => {
    assert.deepEqual(findMarkerInLine("// !important", "!important"), {
      color: undefined,
    });
    assert.deepEqual(findMarkerInLine("# !important:red", "!important"), {
      color: "red",
    });
    assert.deepEqual(findMarkerInLine("-- !important: #ff5500", "!important"), {
      color: "#ff5500",
    });
    assert.deepEqual(findMarkerInLine("<!-- !important:blue -->", "!important"), {
      color: "blue",
    });
    assert.deepEqual(findMarkerInLine("/* !important */", "!important"), {
      color: undefined,
    });
    assert.deepEqual(findMarkerInLine("{{!-- !important:info --}}", "!important"), {
      color: "info",
    });
    assert.deepEqual(findMarkerInLine("' !important", "!important"), {
      color: undefined,
    });
  });

  it("detects inline comments and block-comment continuations", () => {
    assert.deepEqual(findMarkerInLine("const x = 1; // !important", "!important"), {
      color: undefined,
    });
    assert.deepEqual(findMarkerInLine(" * !important:gold", "!important"), {
      color: "gold",
    });
  });

  it("ignores lookalikes", () => {
    assert.equal(findMarkerInLine("https://!important", "!important"), undefined);
    assert.equal(findMarkerInLine("const important = true;", "!important"), undefined);
    assert.equal(findMarkerInLine("// not-a-marker", "!important"), undefined);
  });

  it("still finds a comment after a URL", () => {
    assert.deepEqual(
      findMarkerInLine("const url = 'https://example.com'; // !important", "!important"),
      { color: undefined }
    );
  });
});

describe("parseHighlightRegions", () => {
  it("returns an empty list for empty input", () => {
    assert.deepEqual(parseHighlightRegions("", options), []);
  });

  it("pairs a simple region", () => {
    const text = ["code", "// !important", "alpha", "beta", "// !important", "after"].join("\n");
    assert.deepEqual(parseHighlightRegions(text, options), [
      { startLine: 1, endLine: 4, startMarkerLine: 1, endMarkerLine: 4, color: undefined },
    ]);
  });

  it("can exclude marker lines", () => {
    const text = ["// !important", "body", "// !important"].join("\n");
    assert.deepEqual(parseHighlightRegions(text, { ...options, includeMarkers: false }), [
      { startLine: 1, endLine: 1, startMarkerLine: 0, endMarkerLine: 2, color: undefined },
    ]);
  });

  it("uses an explicit color on the opening marker", () => {
    const text = ["// !important:red", "inner", "// !important"].join("\n");
    assert.deepEqual(parseHighlightRegions(text, options), [
      { startLine: 0, endLine: 2, startMarkerLine: 0, endMarkerLine: 2, color: "red" },
    ]);
  });

  it("supports nested regions when the inner opener has a color", () => {
    const text = [
      "// !important",
      "outer",
      "// !important:#00f",
      "inner",
      "// !important",
      "outer-again",
      "// !important",
    ].join("\n");
    assert.deepEqual(parseHighlightRegions(text, options), [
      { startLine: 2, endLine: 4, startMarkerLine: 2, endMarkerLine: 4, color: "#00f" },
      { startLine: 0, endLine: 6, startMarkerLine: 0, endMarkerLine: 6, color: undefined },
    ]);
  });

  it("ignores unmatched markers", () => {
    const text = ["body", "// !important"].join("\n");
    assert.deepEqual(parseHighlightRegions(text, options), []);
  });

  it("skips empty regions when markers are excluded", () => {
    const text = ["// !important", "// !important"].join("\n");
    assert.deepEqual(parseHighlightRegions(text, { ...options, includeMarkers: false }), []);
  });

  it("parses sequential regions", () => {
    const text = [
      "// !important:gold",
      "one",
      "// !important",
      "gap",
      "// !important:#3b82f6",
      "two",
      "// !important",
    ].join("\n");
    assert.deepEqual(parseHighlightRegions(text, options), [
      { startLine: 0, endLine: 2, startMarkerLine: 0, endMarkerLine: 2, color: "gold" },
      { startLine: 4, endLine: 6, startMarkerLine: 4, endMarkerLine: 6, color: "#3b82f6" },
    ]);
  });
});
