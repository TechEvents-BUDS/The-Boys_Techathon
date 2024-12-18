import _ from 'lodash';

export function performEda(data) {
  const numRows = data.length;
  const numColumns = data[0]?.length || 0;
  const columnTypes = data[0]?.map((_, colIndex) =>
    data.map((row) => row[colIndex]).every((val) => !isNaN(val)) ? 'Numeric' : 'Categorical'
  );

  return {
    numRows,
    numColumns,
    columnTypes,
    nullValues: _.sum(data.flat().map((val) => (val === '' ? 1 : 0))),
  };
}

export function makePredictions(data) {
  // Mock prediction logic
  return data.map((row) => ({ input: row, predictedClass: Math.random() > 0.5 ? 'A' : 'B' }));
}
