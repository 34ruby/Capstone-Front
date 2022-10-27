import { rightHand, leftHand, cognitionErrorCheck } from ".";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
export const fingersCount = (
  results,
  canvasElement,
  canvasCtx,
  vStatus,
  isAvailable
) => {
  let rightHandLandmarks = {};
  let leftHandLandmarks = {};
  let rightFingersStatus = {
    RIGHT_THUMB: false,
    RIGHT_INDEX_FINGER: false,
    RIGHT_MIDDLE_FINGER: false,
    RIGHT_RING_FINGER: false,
    RIGHT_PINKY: false,
  };
  let leftFingersStatus = {
    LEFT_THUMB: false,
    LEFT_INDEX_FINGER: false,
    LEFT_MIDDLE_FINGER: false,
    LEFT_RING_FINGER: false,
    LEFT_PINKY: false,
  };
  let n = 0;
  let conut = 0;

  // 손을 인식해서 접혔는지 상태를 확인
  for (const landmarks of results.multiHandLandmarks) {
    if (results.multiHandedness) {
      // 오른손
      if (results.multiHandedness[n].label == "Right") {
        rightHandLandmarks = landmarks;
        rightFingersStatus = rightHand(rightHandLandmarks, rightFingersStatus);
      }
      // 왼손
      if (results.multiHandedness[n].label == "Left") {
        leftHandLandmarks = landmarks;
        leftFingersStatus = leftHand(leftHandLandmarks, leftFingersStatus);
      }
      n++;
    }

    // 랜드마크대로 손 그림
    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 5,
    });
    drawLandmarks(canvasCtx, landmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });
  }
  // canvasCtx.restore();

  const { text, voteResult } = cognitionErrorCheck(
    rightHandLandmarks,
    rightFingersStatus,
    leftHandLandmarks,
    leftFingersStatus,
    isAvailable
  );
  //   this.voteResult = voteResult;

  if (vStatus) {
    canvasCtx.font = "36px gulim";
    canvasCtx.fillStyle = "rgba(0,0,0)";
    canvasCtx.strokeText = "rgba(0,0,0)";
    canvasCtx.fillText(
      "몇 번을 지목하겠습니까?",
      canvasElement.width / 15,
      canvasElement.height / 8
    );
    canvasCtx.fillText(
      text,
      canvasElement.width / 15,
      (canvasElement.height / 8) * 2
    );
    // console.log(text);
  } else {
    console.log("no fingers");
  }

  // console.log(voteResult)

  return voteResult;
};

// 같은 숫자를 2초간 들고 있을 때,
// 그 값을 이용하여야 한다.
// 2초간 유지되어 출력된 값을 전송
// 저장한느 법
