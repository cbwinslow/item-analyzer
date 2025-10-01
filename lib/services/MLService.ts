import * as tf from '@tensorflow/tfjs';

export class MLService {
  static async predictPreference(userActions: any[]): Promise<string> {
    // Simple model: based on actions, predict next item type
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 10, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

    // Placeholder training data
    const xs = tf.tensor2d([1, 2, 3], [3, 1]);
    const ys = tf.tensor2d([0, 1, 0], [3, 1]);
    await model.fit(xs, ys, { epochs: 10 });

    const prediction = model.predict(tf.tensor2d([userActions.length], [1, 1])) as tf.Tensor;
    const result = (await prediction.data())[0] > 0.5 ? 'electronics' : 'clothing';
    return result;
  }
}