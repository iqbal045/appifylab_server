const { isValidObjectId } = require('mongoose');
const response = require('./response');

const mongooseIdValidator = (objectId, modelName, res) => {
  if (!isValidObjectId(objectId)) {
    return response.error(res, {}, `Invalid ${modelName} Id.`, 400);
  }
};

module.exports = mongooseIdValidator;
