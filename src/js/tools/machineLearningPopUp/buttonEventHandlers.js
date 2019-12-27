import { getAllImageData } from '../imageList/imageList';
import { displayErrorMessage, updateProgressMessage, removeStartButton } from './style';
import { drawShapesViaCoordinates } from '../toolkit/buttonClickEvents/facadeWorkersUtils/drawShapesViaCoordinates/drawShapesViaCoordinates';
import { getCurrentImageId } from '../toolkit/buttonClickEvents/facadeWorkersUtils/stateManager';

let tfModel = null;

function errorHandler() {
  displayErrorMessage();
}

const predictedImageCoordinates = {};

function predict(image) {
  return tfModel.detect(image.data);
}

/*
let stopState = false;

function stopAPromiseAll() {
  stopState = true;
}

function predict(image) {
  return new Promise((resolve, reject) => {
    if (!stopState) {
      tfModel.detect(image.data).then((result) => {resolve(result)});
      // check if we don't need to do .catch((error) => reject(error));
    } else {
      reject();
    }
  });
}

// check if catch works
*/

// TEST
// check that only the images that have been checked have their shapes regenerated

// TEST
// check if it is not too early to display finished as the images still need to
// be updated with shapes

// can cancel on 2 parts, 1 in getting the script, 2 in predicting

function executeAndRecordPredictionResults(promisesArray, predictionIdToImageId) {
  Promise.all(promisesArray)
    .catch(() => {
      // if stopstate = true
      // else display an error
      console.log('error');
      // should return the completed array promises
      return promisesArray;
    })
    // TEST
    // check to see if only the completed operations are returned and should
    // there be more work needed to match the IDs
    .then((predictions) => {
      for (let i = 0; i < predictions.length; i += 1) {
        predictedImageCoordinates[predictionIdToImageId[i]] = predictions[i];
      }
      drawShapesViaCoordinates(predictedImageCoordinates);
      updateProgressMessage('Finished!');
    });
}

// TEST
// check that the current image shapes are being regenerated by the model

// decided not to store generated shapes because if you have 100 images with
// 100s of shapes, it would lead to significant memory usage
function makePredictionsForAllImages() {
  const predictPromises = [];
  const allImageData = getAllImageData();
  const predictionIdToImageId = [];
  const currentImageId = getCurrentImageId();
  for (let i = 0; i < allImageData.length; i += 1) {
    const image = allImageData[i];
    if (image.numberOfMLGeneratedShapes === 0) {
      predictPromises.push(predict(image));
      predictionIdToImageId.push(i);
    } else if (i === currentImageId) {
      predictPromises.push(predict(image));
      predictionIdToImageId.push(i);
    }
  }
  executeAndRecordPredictionResults(predictPromises, predictionIdToImageId);
}

function loadModel() {
  return new Promise((resolve, reject) => {
    const { cocoSsd } = window;
    cocoSsd.load().then((model) => {
      tfModel = model;
      resolve();
    }).catch(() => {
      reject();
    });
  });
}

function downloadCOCOSSD() {
  return new Promise((resolve, reject) => {
    const cocoSSDScript = document.createElement('script');
    cocoSSDScript.onload = resolve;
    cocoSSDScript.onerror = reject;
    cocoSSDScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd';
    document.head.appendChild(cocoSSDScript);
  });
}

function downloadTensorflowJS() {
  return new Promise((resolve, reject) => {
    // loading spinner, maybe something funky with ML?
    updateProgressMessage('In Progress...');
    removeStartButton();
    const tensorflowJSScript = document.createElement('script');
    tensorflowJSScript.onload = resolve;
    tensorflowJSScript.onerror = reject;
    tensorflowJSScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
    document.head.appendChild(tensorflowJSScript);
  });
}

function startMachineLearning() {
  drawShapesViaCoordinates();
  // if (!tfModel) {
  //   downloadTensorflowJS()
  //     .then(() => downloadCOCOSSD())
  //     .then(() => loadModel())
  //     .then(() => makePredictionsForAllImages())
  //     .catch(() => errorHandler());
  // } else {
  //   makePredictionsForAllImages();
  // }
}

export { startMachineLearning as default };
