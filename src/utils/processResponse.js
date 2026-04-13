/**
 * Processes raw Genderize API response into the required shape.
 *
 * @param {object} raw  - Parsed JSON from Genderize
 * @returns {{ data: object }|{ edgeCase: true }}
 */
function processGenderizeResponse(raw) {
  const { name, gender, probability, count } = raw;

  if (gender === null || count === 0) {
    return { edgeCase: true };
  }

  const sample_size = count;

  const is_confident = probability >= 0.7 && sample_size >= 100;

  const processed_at = new Date().toISOString();

  return {
    data: {
      name,
      gender,
      probability,
      sample_size,
      is_confident,
      processed_at,
    },
  };
}

module.exports = { processGenderizeResponse };
