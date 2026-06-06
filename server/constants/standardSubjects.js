const STANDARD_SUBJECTS = Object.freeze({
  // Standard I–II
  "I-II": [
    "Reading and Writing",
    "English",
    "Arithmetic",
    "Health and Environment",
    "Culture"
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

  // Standard V–VI (includes Religious)
  "V-VI": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education",
    "Religious Education"
  ],

  // Standard VII (excludes Religious)
  "VII": [
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

  // Accept group keys directly
  if (["I-II", "III-IV", "V-VI", "VII"].includes(s)) return s;

  const roman = s.toUpperCase();
  if (["I", "II"].includes(roman)) return "I-II";
  if (["III", "IV"].includes(roman)) return "III-IV";
  if (["V", "VI"].includes(roman)) return "V-VI";
  if (["VII"].includes(roman)) return "VII";

  // Also accept numeric standards: 1..7
  const asNum = Number(s);
  if (asNum >= 1 && asNum <= 2) return "I-II";
  if (asNum >= 3 && asNum <= 4) return "III-IV";
  if (asNum >= 5 && asNum <= 6) return "V-VI";
  if (asNum === 7) return "VII";

  return null;
}

module.exports = {
  STANDARD_SUBJECTS,
  getStandardKey
};


