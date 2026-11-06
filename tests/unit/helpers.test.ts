import {
  buildFilePath,
  parseId,
  removeUndefinedFields,
} from "../../src/utils/helpers.js";

describe("helpers", () => {
  describe("removeUndefinedFields", () => {
    it("strips undefined keys while keeping null, zero, and empty string", () => {
      const input = {
        name: "Test",
        desc: undefined,
        points: 0,
        empty: "",
        nullable: null,
      };

      const result = removeUndefinedFields(input);
      expect(result).toEqual({
        name: "Test",
        points: 0,
        empty: "",
        nullable: null,
      });
      expect("desc" in result).toBe(false);
    });
  });

  describe("parseId", () => {
    it("parses valid integer strings", () => {
      expect(parseId("42")).toBe(42);
      expect(parseId("0")).toBe(0);
    });
  });

  describe("buildFilePath", () => {
    it("prefixes filename with /files/", () => {
      expect(buildFilePath("image.png")).toBe("/files/image.png");
    });
  });
});
