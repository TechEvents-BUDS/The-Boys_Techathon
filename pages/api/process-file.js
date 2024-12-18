import { performEda, makePredictions } from '../../utils/eda-utils';

export default async function handler(req, res) {
  const { data } = req.body;

  // Perform EDA
  const edaResults = performEda(data);

  // Make Predictions
  const predictionResults = makePredictions(data);

  res.status(200).json({ eda: edaResults, predictions: predictionResults });
}
