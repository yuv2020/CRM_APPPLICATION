const db = require('../models');
const assert = require('assert');
const services = require('../../services/file');

module.exports = class FileDBApi {
  static async replaceRelationFiles(relation, rawFiles, options) {
    assert(relation.belongsTo, 'belongsTo is required');
    assert(relation.belongsToColumn, 'belongsToColumn is required');
    assert(relation.belongsToId, 'belongsToId is required');

    let files = [];

    if (Array.isArray(rawFiles)) {
      files = rawFiles;
    } else {
      files = rawFiles ? [rawFiles] : [];
    }

    await this._removeLegacyFiles(relation, files, options);
    await this._addFiles(relation, files, options);
  }

  static async _addFiles(relation, files, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };

    const inexistentFiles = files.filter((file) => !!file.new)}
}