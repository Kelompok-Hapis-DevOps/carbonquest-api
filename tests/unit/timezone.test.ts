import {
  convertDatesToJakarta,
  formatDateIndonesia,
  getJakartaDayRange,
  getJakartaMonthRange,
  getJakartaWeekRange,
  nowJakarta,
  toJakartaTime,
} from "../../src/utils/timezone.js";

describe("timezone utils", () => {
  describe("toJakartaTime", () => {
    it("returns null for falsy inputs", () => {
      expect(toJakartaTime(null)).toBeNull();
      expect(toJakartaTime(undefined)).toBeNull();
    });

    it("formats ISO string with +07:00 offset", () => {
      const formatted = toJakartaTime(new Date("2026-11-06T00:00:00Z"));
      expect(formatted).toMatch(/\+07:00$/);
      expect(formatted).toContain("2026-11-06");
    });
  });

  describe("getJakartaDayRange", () => {
    it("produces a 24-hour range", () => {
      const { start, end } = getJakartaDayRange(new Date("2026-11-06T12:00:00Z"));
      expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("getJakartaWeekRange", () => {
    it("produces a 7-day range starting on Monday", () => {
      const { start, end } = getJakartaWeekRange(new Date("2026-11-06T12:00:00Z"));
      expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe("getJakartaMonthRange", () => {
    it("starts on day 1 of the Jakarta month", () => {
      const { start, end } = getJakartaMonthRange(new Date("2026-11-15T12:00:00Z"));
      expect(toJakartaTime(start)).toContain("2026-11-01");
      expect(toJakartaTime(end)).toContain("2026-12-01");
    });
  });

  describe("formatDateIndonesia", () => {
    it("formats date in id-ID locale", () => {
      const formatted = formatDateIndonesia(new Date("2026-11-06T10:00:00+07:00"));
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("November");
    });

    it("returns null for falsy inputs", () => {
      expect(formatDateIndonesia(null)).toBeNull();
    });
  });

  describe("convertDatesToJakarta", () => {
    it("recursively converts Date fields in objects", () => {
      const input = {
        id: 1,
        created_at: new Date("2026-11-06T00:00:00Z"),
        nested: {
          birth_date: new Date("1995-05-10T00:00:00Z"),
        },
      };

      const converted = convertDatesToJakarta(input);
      expect(typeof converted.created_at).toBe("string");
      expect(converted.created_at).toMatch(/\+07:00$/);
      expect(typeof converted.nested.birth_date).toBe("string");
    });
  });

  describe("nowJakarta", () => {
    it("returns a Date instance", () => {
      expect(nowJakarta()).toBeInstanceOf(Date);
    });
  });
});
