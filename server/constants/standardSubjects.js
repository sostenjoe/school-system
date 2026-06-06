const STANDARD_SUBJECTS = Object.freeze({
  // Standard I–II (grouped as the user requested)
  // Note: ensure these names are used consistently everywhere.
  "I-II": [
    "Reading and Writing",
    "Arithmetic",
    "Basic English",
    "Health and Environment",
    "Culture",
    "Arts and Sports"
  ],

  // Standard III–IV
  "III-IV": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education",
    "Religious Education"
  ],

  // Standard V–VII
  "V-VII": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education"
  ]
});

function getStandardKey(standard) {
  const s = String(standard || "").trim();
  // Accept inputs like "I", "II", "III", ... or "I-II" / "III-IV" / "V-VII"
  if (["I-II", "III-IV", "V-VII"].includes(s)) return s;

  const roman = s.toUpperCase();
  if (["I", "II"].includes(roman)) return "I-II";
  if (["III", "IV"].includes(roman)) return "III-IV";
  if (["V", "VI", "VII"].includes(roman)) return "V-VII";

  // Also accept numeric standards: 1..7
  const asNum = Number(s);
  if (asNum >= 1 && asNum <= 2) return "I-II";
  if (asNum >= 3 && asNum <= 4) return "III-IV";
  if (asNum >= 5 && asNum <= 7) return "V-VII";

  return null;
}

module.exports = {
  STANDARD_SUBJECTS,
  getStandardKey
};

