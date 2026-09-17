import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COLOR,
  DEFAULT_TOKEN,
  loadConfigFrom,
  sanitizeColor,
  sanitizeToken,
  withAlpha,
} from "./config";

describe("sanitizeToken", () => {
  it("accepts !important and similar marker names", () => {
    assert.equal(sanitizeToken("!important", "fallback"), "!important");
    assert.equal(sanitizeToken("important", "fallback"), "important");
    assert.equal(sanitizeToken("hl_end", "fallback"), "hl_end");
  });

  it("rejects empty, oversized, or regex-unsafe values", () => {
    assert.equal(sanitizeToken("", "fallback"), "fallback");
    assert.equal(sanitizeToken("a".repeat(80), "fallback"), "fallback");
    assert.equal(sanitizeToken("start(.*)", "fallback"), "fallback");
    assert.equal(sanitizeToken("!important:red", "fallback"), "fallback");
    assert.equal(sanitizeToken(12, "fallback"), "fallback");
  });
});

describe("sanitizeColor", () => {
  it("allows common CSS color formats", () => {
    assert.equal(sanitizeColor("#fc0"), "#fc0");
    assert.equal(sanitizeColor("#ffcc00"), "#ffcc00");
    assert.equal(sanitizeColor("rgba(255, 208, 64, 0.16)"), "rgba(255, 208, 64, 0.16)");
    assert.equal(sanitizeColor("gold"), "gold");
  });

  it("rejects unsafe values", () => {
    assert.equal(sanitizeColor("red; background: url(javascript:alert(1))"), undefined);
    assert.equal(sanitizeColor("expression(alert(1))"), undefined);
    assert.equal(sanitizeColor("url(http://example.com)"), undefined);
  });
});

describe("withAlpha", () => {
  it("converts hex colors to rgba", () => {
    assert.equal(withAlpha("#e6b422", 0.16), "rgba(230, 180, 34, 0.16)");
    assert.equal(withAlpha("#fc0", 0.8), "rgba(255, 204, 0, 0.8)");
  });
});

describe("loadConfigFrom", () => {
  it("loads sanitized settings with defaults", () => {
    const config = loadConfigFrom({
      get<T>(key: string): T | undefined {
        const values: Record<string, unknown> = {
          enabled: false,
          token: "begin(.*)",
          defaultColor: "not a color",
          includeMarkers: false,
        };
        return values[key] as T | undefined;
      },
    });
    assert.equal(config.enabled, false);
    assert.equal(config.token, DEFAULT_TOKEN);
    assert.equal(config.defaultColor, DEFAULT_COLOR);
    assert.equal(config.includeMarkers, false);
    assert.equal(config.wholeLine, true);
  });

  it("accepts a custom default color", () => {
    const config = loadConfigFrom({
      get<T>(key: string): T | undefined {
        const values: Record<string, unknown> = {
          token: "!important",
          defaultColor: "#ff5500",
        };
        return values[key] as T | undefined;
      },
    });
    assert.equal(config.token, "!important");
    assert.equal(config.defaultColor, "#ff5500");
  });
});
