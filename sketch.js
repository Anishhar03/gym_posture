let capture;
let poseNet;
let singlePose;
let skeleton;
let exerciseType = "squat"; // Default exercise type
let feedback = "";

function setup() {
  createCanvas(800, 500);
  capture = createCapture(VIDEO);
  capture.size(640, 480); // Set the size of the capture
  capture.hide();
  poseNet = ml5.poseNet(capture, modelLoaded);
  poseNet.on('pose', receivedPose);

  // Create buttons for selecting exercises
  createButton('Squat').position(10, 510).mousePressed(() => selectExercise('squat'));
  createButton('Push-Up').position(70, 510).mousePressed(() => selectExercise('pushup'));
  createButton('Deadlift').position(140, 510).mousePressed(() => selectExercise('deadlift'));
}

function receivedPose(poses) {
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
    checkPosture(singlePose); // Evaluate posture here
  }
}

function modelLoaded() {
  console.log("PoseNet model loaded");
}

function draw() {
  image(capture, 0, 0, 800, 500); // Draw the video on the canvas
  fill(255, 0, 0);
  if (singlePose) {
    let scaleX = width / capture.width;
    let scaleY = height / capture.height;

    // Draw keypoints
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      let x = singlePose.keypoints[i].position.x * scaleX;
      let y = singlePose.keypoints[i].position.y * scaleY;
      ellipse(x, y, 10);
    }

    // Draw skeleton
    stroke(255, 255, 255);
    strokeWeight(2);
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      let x1 = partA.position.x * scaleX;
      let y1 = partA.position.y * scaleY;
      let x2 = partB.position.x * scaleX;
      let y2 = partB.position.y * scaleY;
      line(x1, y1, x2, y2);
    }

    // Display feedback
    fill(0, 255, 0);
    textSize(24);
    text(feedback, 10, height - 10);
  }
}

function selectExercise(exercise) {
  exerciseType = exercise;
}

function checkPosture(pose) {
  if (exerciseType === 'squat') {
    checkSquatPosture(pose);
  } else if (exerciseType === 'pushup') {
    checkPushupPosture(pose);
  } else if (exerciseType === 'deadlift') {
    checkDeadliftPosture(pose);
  }
}

function checkSquatPosture(pose) {
  let leftKnee = pose.leftKnee;
  let rightKnee = pose.rightKnee;
  let leftHip = pose.leftHip;
  let rightHip = pose.rightHip;
  let leftAnkle = pose.leftAnkle;
  let rightAnkle = pose.rightAnkle;

  // Calculate angles to evaluate squat posture
  let kneeAngleLeft = calculateAngle(leftHip, leftKnee, leftAnkle);
  let kneeAngleRight = calculateAngle(rightHip, rightKnee, rightAnkle);

  if (kneeAngleLeft > 70 && kneeAngleRight > 70) {
    feedback = "Good squat posture!";
  } else {
    feedback = "Adjust your squat posture!";
  }
}

function checkPushupPosture(pose) {
  let leftShoulder = pose.leftShoulder;
  let rightShoulder = pose.rightShoulder;
  let leftElbow = pose.leftElbow;
  let rightElbow = pose.rightElbow;
  let leftWrist = pose.leftWrist;
  let rightWrist = pose.rightWrist;

  // Calculate angles to evaluate push-up posture
  let elbowAngleLeft = calculateAngle(leftShoulder, leftElbow, leftWrist);
  let elbowAngleRight = calculateAngle(rightShoulder, rightElbow, rightWrist);

  if (elbowAngleLeft > 160 && elbowAngleRight > 160) {
    feedback = "Good push-up posture!";
  } else {
    feedback = "Adjust your push-up posture!";
  }
}

function checkDeadliftPosture(pose) {
  let leftShoulder = pose.leftShoulder;
  let rightShoulder = pose.rightShoulder;
  let leftHip = pose.leftHip;
  let rightHip = pose.rightHip;
  let leftKnee = pose.leftKnee;
  let rightKnee = pose.rightKnee;

  // Calculate angles to evaluate deadlift posture
  let hipAngleLeft = calculateAngle(leftShoulder, leftHip, leftKnee);
  let hipAngleRight = calculateAngle(rightShoulder, rightHip, rightKnee);

  if (hipAngleLeft > 70 && hipAngleRight > 70) {
    feedback = "Good deadlift posture!";
  } else {
    feedback = "Adjust your deadlift posture!";
  }
}

function calculateAngle(A, B, C) {
  let AB = dist(A.x, A.y, B.x, B.y);
  let BC = dist(B.x, B.y, C.x, C.y);
  let AC = dist(A.x, A.y, C.x, C.y);
  return Math.acos((AB * AB + BC * BC - AC * AC) / (2 * AB * BC)) * (180 / Math.PI);
}
