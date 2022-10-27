export const cognitionErrorCheck = (
  rightHandLandmarks,
  rightFingersStatus,
  leftHandLandmarks,
  leftFingersStatus,
  isAvailable
) => {
  let recognitionError;
  let text = "";
  let voteResult = 0;
  if (rightHandLandmarks.length > 0) {
    if (
      rightHandLandmarks[0]["y"] < rightHandLandmarks[1]["y"] ||
      (rightHandLandmarks[0]["y"] - rightHandLandmarks[5]["y"]) / 2 >
        rightHandLandmarks[0]["y"] - rightHandLandmarks[17]["y"]
    ) {
      recognitionError = true;
      text = "손을 정확하게 인식시켜주세요.";
    }
  }

  if (leftHandLandmarks.length > 0) {
    if (
      leftHandLandmarks[0]["y"] < leftHandLandmarks[1]["y"] ||
      (leftHandLandmarks[0]["y"] - leftHandLandmarks[5]["y"]) / 2 >
        leftHandLandmarks[0]["y"] - leftHandLandmarks[17]["y"]
    ) {
      recognitionError = true;
      text = "손을 정확하게 인식시켜주세요.";
    }
  }

  if (
    !recognitionError &&
    (rightHandLandmarks.length > 0 || leftHandLandmarks.length > 0)
  ) {
    let rightFingersCount = 0;
    let leftFingersCount = 0;

    for (let fingersStatus of Object.values(rightFingersStatus)) {
      if (fingersStatus == true) {
        rightFingersCount += 1;
      }
    }

    for (let fingers of Object.values(leftFingersStatus)) {
      if (fingers == true) {
        leftFingersCount += 1;
      }
    }

    voteResult = rightFingersCount + leftFingersCount;
    if (isAvailable === 0) {
      text = voteResult + "번은 없습니다.";
    } else if (isAvailable === -1) {
      text = voteResult + "번은 이미 죽었습니다.";
    } else if (isAvailable === -2) {
      text = "";
    } else {
      text = voteResult + "번";
    }
  }

  return { text, voteResult };
};
