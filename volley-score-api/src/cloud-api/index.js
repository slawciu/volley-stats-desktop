const getSpreadsheetName = async () => {};

const storeOpponentAttackRecordInSpreadsheet = async (
  spreadsheetId,
  attackRecord
) => {};

const storeLogInSpreadsheet = async (spreadsheetId, statsRecord) => {};

const createSpreadsheetForGame = async (fileName) => {};

module.exports = {
  getSpreadsheetName,
  createSpreadsheetForGame,
  storeLogInSpreadsheet,
  storeOpponentAttackRecordInSpreadsheet,
};
