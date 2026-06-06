const STANDARD_SUBJECTS = Object.freeze({
  // Standard I
  "I": [
    "Reading and Writing",
    "English",
    "Arithmetic",
    "Health and Environment",
    "Culture"
  ],

  // Standard II
  "II": [
    "Reading and Writing",
    "English",
    "Arithmetic",
    "Health and Environment",
    "Culture"
  ],

  // Standard III
  "III": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education",
    "Religious Education"
  ],

  // Standard IV
  "IV": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education",
    "Religious Education"
  ],

  // Standard V
  "V": [
    "Kiswahili",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Civic and Moral Education",
    "Religious Education"
  ],

  // Standard VI
  "VI": [
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

  const roman = s.toUpperCase();

  // Accept exact standard values directly
  if (["I","II","III","IV","V","VI","VII"].includes(roman)) return roman;

  // Backward compatibility: accept old grouped keys and map them to the intersection of members
  // (Used only if some old UI still sends I-II / III-IV / V-VI.)
  if (["I-II", "III-IV", "V-VI", "VII"].includes(s)) return s;

  // Also accept numeric standards: 1..7
  const asNum = Number(s);
  if (asNum >= 1 && asNum <= 7) return String(asNum).toUpperCase();


  return null;
}

module.exports = {
  STANDARD_SUBJECTS,
  getStandardKey
};


