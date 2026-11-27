// Convert string to ObjectId
function toObjectId(ObjectId, id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

module.exports = { toObjectId };
