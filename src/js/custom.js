/**
 * Custom implementation for the FingerPrint
 * Reader and other JS functions
 * @authors Dahir Muhammad Dahir (dahirmuhammad3@gmail.com)
 * @date    2020-04-14 17:06:41
 * @version 1.0.0
 */

let currentFormat = Fingerprint.SampleFormat.Intermediate;

let FingerprintSdkTest = (function () {
  function FingerprintSdkTest() {
    let _instance = this;
    this.operationToRestart = null;
    this.acquisitionStarted = false;
    // instantiating the fingerprint sdk here
    this.sdk = new Fingerprint.WebApi();
    this.sdk.onDeviceConnected = function (e) {
      // Detects if the device is connected for which acquisition started
      showMessage("Scan Appropriate Finger on the Reader", "success");
    };
    this.sdk.onDeviceDisconnected = function (e) {
      // Detects if device gets disconnected - provides deviceUid of disconnected device
      showMessage("Device is Disconnected. Please Connect Back");
    };
    this.sdk.onCommunicationFailed = function (e) {
      // Detects if there is a failure in communicating with U.R.U web SDK
      showMessage("Communication Failed. Please Reconnect Device");
    };
    this.sdk.onSamplesAcquired = function (s) {
      // Sample acquired event triggers this function
      storeSample(s);
    };
    this.sdk.onQualityReported = function (e) {
      // Quality of sample acquired - Function triggered on every sample acquired
      //document.getElementById("qualityInputBox").value = Fingerprint.QualityCode[(e.quality)];
    };
  }

  // this is were finger print capture takes place
  FingerprintSdkTest.prototype.startCapture = function () {
    if (this.acquisitionStarted)
      // Monitoring if already started capturing
      return;
    let _instance = this;
    showMessage("");
    this.operationToRestart = this.startCapture;
    this.sdk.startAcquisition(currentFormat, "").then(
      function () {
        _instance.acquisitionStarted = true;

        //Disabling start once started
        //disableEnableStartStop();
      },
      function (error) {
        showMessage(error.message);
      }
    );
  };

  FingerprintSdkTest.prototype.stopCapture = function () {
    if (!this.acquisitionStarted)
      //Monitor if already stopped capturing
      return;
    let _instance = this;
    showMessage("");
    this.sdk.stopAcquisition().then(
      function () {
        _instance.acquisitionStarted = false;

        //Disabling stop once stopped
        //disableEnableStartStop();
      },
      function (error) {
        showMessage(error.message);
      }
    );
  };

  FingerprintSdkTest.prototype.getInfo = function () {
    let _instance = this;
    return this.sdk.enumerateDevices();
  };

  FingerprintSdkTest.prototype.getDeviceInfoWithID = function (uid) {
    let _instance = this;
    return this.sdk.getDeviceInfo(uid);
  };

  return FingerprintSdkTest;
})();

class Reader {
  constructor() {
    this.reader = new FingerprintSdkTest();
    this.selectFieldID = null;
    this.currentStatusField = null;
    /**
     * @type {Hand}
     */
    this.currentHand = null;
  }

  readerSelectField(selectFieldID) {
    this.selectFieldID = selectFieldID;
  }

  setStatusField(statusFieldID) {
    this.currentStatusField = statusFieldID;
  }

  displayReader() {
    let readers = this.reader.getInfo(); // grab available readers here
    let id = this.selectFieldID;
    let selectField = document.getElementById(id);
    selectField.innerHTML = `<option>Select Fingerprint Reader</option>`;
    readers.then(function (availableReaders) {
      // when promise is fulfilled
      if (availableReaders.length > 0) {
        showMessage("");
        for (let reader of availableReaders) {
          selectField.innerHTML += `<option value="${reader}" selected>${reader}</option>`;
        }
      } else {
        showMessage("Please Connect the Fingerprint Reader");
      }
    });
  }
}

class Hand {
  constructor() {
    this.employee_id = 0;
    this.index_finger = [];
    this.middle_finger = [];
  }

  addIndexFingerSample(sample) {
    this.index_finger.push(sample);
  }

  addMiddleFingerSample(sample) {
    this.middle_finger.push(sample);
  }

  generateFullHand() {
    let employee_id = this.employee_id;
    let index_finger = this.index_finger;
    let middle_finger = this.middle_finger;
    return JSON.stringify({ employee_id, index_finger, middle_finger });
  }
}

let myReader = new Reader();

function beginEnrollment() {
  setReaderSelectField("enrollReaderSelect");
  myReader.setStatusField("enrollmentStatusField");
  myReader.displayReader(); // This will populate the reader dropdown
}

function beginIdentification() {
  setReaderSelectField("verifyReaderSelect");
  myReader.setStatusField("verifyIdentityStatusField");
  myReader.displayReader(); // This will populate the reader dropdown
}

function setReaderSelectField(fieldName) {
  myReader.readerSelectField(fieldName);
}

function showMessage(message, message_type = "error") {
  let types = new Map();
  types.set("success", "text-green-500 font-semibold");
  types.set("error", "text-red-500 font-semibold");
  let statusFieldID = myReader.currentStatusField;
  if (statusFieldID) {
    let statusField = document.getElementById(statusFieldID);
    statusField.innerHTML = `<p class="${types.get(
      message_type
    )}">${message}</p>`;
  }
}

function beginCapture() {
  if (!readyForEnroll()) {
    return;
  }
  myReader.currentHand = new Hand();
  storeUserID(); // for current user in Hand instance
  myReader.reader.startCapture();
  showNextNotEnrolledItem();
  // Enable Enroll, disable Start Capture
  var enrollBtn = document.getElementById("enrollBtn");
  if (enrollBtn) enrollBtn.disabled = false;
  var startBtn = document.getElementById("startCaptureBtnModal");
  if (startBtn) startBtn.disabled = true;
}

function captureForIdentify() {
  if (!readyForIdentify()) {
    return;
  }
  myReader.currentHand = new Hand();
  myReader.reader.startCapture();
  showNextNotEnrolledItem();
}

/**
 * @returns {boolean}
 */
function readyForEnroll() {
  return (
    document.getElementById("userID").value !== "" &&
    document.getElementById("enrollReaderSelect").value !==
      "Select Fingerprint Reader"
  );
}

/**
 * @returns {boolean}
 */
function readyForIdentify() {
  return (
    document.getElementById("verifyReaderSelect").value !==
    "Select Fingerprint Reader"
  );
}

function clearCapture() {
  clearInputs();
  clearPrints();
  clearHand();
  myReader.reader.stopCapture();
  document.getElementById("userDetails").innerHTML = "";
  // If the capture modal is open, start scanning again
  if (typeof $ !== "undefined" && $("#captureModal").hasClass("show")) {
    beginCapture();
  }
}

function clearInputs() {
  document.getElementById("userID").value = "";
  document.getElementById("userIDVerify").value = "";
  //let id = myReader.selectFieldID;
  //let selectField = document.getElementById(id);
  //selectField.innerHTML = `<option>Select Fingerprint Reader</option>`;
}

function clearPrints() {
  let indexFingers = document.getElementById("indexFingers");
  let middleFingers = document.getElementById("middleFingers");
  let verifyFingers = document.getElementById("verificationFingers");

  if (indexFingers) {
    for (let indexfingerElement of indexFingers.children) {
      indexfingerElement.innerHTML = `<span class="icon icon-indexfinger-not-enrolled" title="not_enrolled"></span>`;
    }
  }

  if (middleFingers) {
    for (let middlefingerElement of middleFingers.children) {
      middlefingerElement.innerHTML = `<span class="icon icon-thumb-not-enrolled" title="not_enrolled"></span>`;
    }
  }

  if (verifyFingers) {
    for (let finger of verifyFingers.children) {
      finger.innerHTML = `<span class="icon icon-indexfinger-not-enrolled" title="not_enrolled"></span>`;
    }
  }
}

function clearHand() {
  myReader.currentHand = null;
}

function showSampleCaptured() {
  let nextElementID = getNextNotEnrolledID();
  let markup = null;
  if (
    nextElementID.startsWith("index") ||
    nextElementID.startsWith("verification")
  ) {
    markup = `<span class="icon icon-indexfinger-enrolled" title="enrolled"></span>`;
  }

  if (nextElementID.startsWith("middle")) {
    markup = `<span class="icon icon-thumb-enrolled" title="enrolled"></span>`;
  }

  if (nextElementID !== "" && markup) {
    let nextElement = document.getElementById(nextElementID);
    nextElement.innerHTML = markup;
  }
}

function showNextNotEnrolledItem() {
  let nextElementID = getNextNotEnrolledID();
  let markup = null;
  if (
    nextElementID.startsWith("index") ||
    nextElementID.startsWith("verification")
  ) {
    markup = `<span class="icon capture-indexfinger" title="not_enrolled"></span>`;
  }

  if (nextElementID.startsWith("middle")) {
    markup = `<span class="icon capture-thumb" title="not_enrolled"></span>`;
  }

  if (nextElementID !== "" && markup) {
    let nextElement = document.getElementById(nextElementID);
    nextElement.innerHTML = markup;
  }
}

/**
 * @returns {string}
 */
function getNextNotEnrolledID() {
  let indexFingers = document.getElementById("indexFingers");
  let middleFingers = document.getElementById("middleFingers");
  let verifyFingers = document.getElementById("verificationFingers");

  let indexFingerElement = findElementNotEnrolled(indexFingers);
  let middleFingerElement = findElementNotEnrolled(middleFingers);
  let verifyFingerElement = findElementNotEnrolled(verifyFingers);

  // For verification, prioritize the verification finger
  if (verifyFingerElement !== null) {
    return verifyFingerElement.id;
  }

  // For enrollment, check index then middle finger
  if (indexFingerElement !== null) {
    return indexFingerElement.id;
  }

  if (middleFingerElement !== null) {
    return middleFingerElement.id;
  }

  return "";
}

/**
 *
 * @param {Element} element
 * @returns {Element}
 */
function findElementNotEnrolled(element) {
  if (element) {
    for (let fingerElement of element.children) {
      if (
        fingerElement.firstElementChild &&
        fingerElement.firstElementChild.title === "not_enrolled"
      ) {
        return fingerElement;
      }
    }
  }
  return null;
}

function storeUserID() {
  let enrollUserId = document.getElementById("userID").value;
  let identifyUserId = document.getElementById("userIDVerify");

  // Only store user ID if we're in enrollment mode
  if (enrollUserId !== "") {
    myReader.currentHand.employee_id = enrollUserId;
  }
}

function storeSample(sample) {
  let samples = JSON.parse(sample.samples);
  let sampleData = samples[0].Data;

  let nextElementID = getNextNotEnrolledID();

  if (
    nextElementID.startsWith("index") ||
    nextElementID.startsWith("verification")
  ) {
    myReader.currentHand.addIndexFingerSample(sampleData);
    showSampleCaptured();
    console.log("Success: Index finger scanned successfully");
    // Automatically trigger identification after capturing
    if (nextElementID.startsWith("verification")) {
      setTimeout(() => {
        serverIdentify();
      }, 500); // Small delay to ensure the UI updates
    } else {
      showNextNotEnrolledItem();
    }
    return;
  }

  if (nextElementID.startsWith("middle")) {
    myReader.currentHand.addMiddleFingerSample(sampleData);
    showSampleCaptured();
    console.log("Success: Thumb scanned successfully");
    showNextNotEnrolledItem();
  }
}

function serverEnroll() {
  if (!readyForEnroll()) {
    return;
  }

  // // Get current time in YYYY-MM-DD HH:MM:SS format
  // const now = new Date();
  // const pad = (n) => n.toString().padStart(2, "0");
  // // const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
  // //   now.getDate()
  // // )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  let data = myReader.currentHand.generateFullHand();
  let successMessage = "Enrollment Successful!";
  let failedMessage = "Enrollment Failed!";
  let payload = `data=${data}`;

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      if (this.responseText === "success") {
        showMessage(successMessage, "success");
        clearCapture();
        if (typeof $ !== "undefined" && $("#captureModal").length) {
          $("#captureModal").on("hidden.bs.modal", function () {
            showToast(successMessage, "success");
            // Remove this handler after firing once
            $(this).off("hidden.bs.modal");
          });
          $("#captureModal").modal("hide");
        } else {
          showToast(successMessage, "success");
        }
      } else {
        showMessage(`${failedMessage} ${this.responseText}`);
        if (typeof $ !== "undefined" && $("#captureModal").length) {
          $("#captureModal").on("hidden.bs.modal", function () {
            showToast(failedMessage, "error");
            $(this).off("hidden.bs.modal");
          });
          $("#captureModal").modal("hide");
        } else {
          showToast(failedMessage, "error");
        }
      }
    }
  };

  xhttp.open("POST", "/src/core/enroll.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(payload);
}

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className =
    "px-4 py-2 rounded shadow text-white font-semibold " +
    (type === "success" ? "bg-green-600" : "bg-red-600");
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function serverIdentify() {
  if (!readyForIdentify()) {
    return;
  }

  let data = myReader.currentHand.generateFullHand();
  let detailElement = document.getElementById("userDetails");
  let payload = `data=${data}`;

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let response;
      try {
        response = JSON.parse(this.responseText);
      } catch (e) {
        showToast("Error processing server response", "error");
        hideModal();
        setTimeout(clearCapture, 5000);
        return;
      }

      if (
        Array.isArray(response) &&
        response.length > 0 &&
        response[0].fullname &&
        response[0].employee_id
      ) {
        // Success
        showToast("Identification Successful!", "success");
        // Update user info section with the identified user's info
        document.getElementById("displayFullname").textContent =
          response[0].fullname;
        document.getElementById("displayEmployeeId").textContent =
          response[0].employee_id;

        // Fetch and render recent attendance logs for this user
        fetchAttendanceLogs(response[0].employee_id, function (res) {
          if (res.status === "success") {
            renderAttendanceLogs(res.logs);
          }
        });

        // Log attendance if action is set
        if (
          typeof pendingAttendanceAction !== "undefined" &&
          pendingAttendanceAction
        ) {
          const now = new Date();
          const pad = (n) => n.toString().padStart(2, "0");
          const timeStr = `${now.getFullYear()}-${pad(
            now.getMonth() + 1
          )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
            now.getMinutes()
          )}:${pad(now.getSeconds())}`;
          logAttendance(
            response[0].employee_id,
            timeStr,
            pendingAttendanceAction === "login",
            function (attRes) {
              if (attRes.status === "success") {
                showToast("Attendance logged!", "success");
              } else {
                showToast(
                  "Failed to log attendance: " + attRes.message,
                  "error"
                );
              }
            }
          );
          pendingAttendanceAction = null; // reset after logging
        }
      } else {
        // Failure
        showToast("Identification Failed! No match found.", "error");
      }
      hideModal();
      setTimeout(clearCapture, 5000);
    }
  };

  xhttp.open("POST", "/src/core/verify.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(payload);
}

function logAttendance(employee_id, time, log_in, callback) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/src/core/attendance.php", true);
  xhttp.setRequestHeader("Content-Type", "application/json");

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      let response;
      try {
        response = JSON.parse(this.responseText);
        fetchAttendanceLogs(employee_id, function (res) {
          if (res.status === "success") {
            renderAttendanceLogs(res.logs);
          }
        });
      } catch (e) {
        if (callback)
          callback({ status: "error", message: "Invalid server response" });
        return;
      }
      if (callback) callback(response);
    }
  };

  const data = {
    employee_id: employee_id,
    time: time, // format: 'YYYY-MM-DD HH:MM:SS'
    log_in: !!log_in, // true for log in, false for log out
  };
  xhttp.send(JSON.stringify(data));
}

function fetchAttendanceLogs(employee_id, callback) {
  const xhttp = new XMLHttpRequest();
  xhttp.open(
    "GET",
    "/src/core/attendance.php?employee_id=" + encodeURIComponent(employee_id),
    true
  );

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      let response;
      try {
        response = JSON.parse(this.responseText);
      } catch (e) {
        if (callback) callback({ status: "error", logs: [] });
        return;
      }
      if (callback) callback(response);
    }
  };

  xhttp.send();
}

function renderAttendanceLogs(logs) {
  const container = document.getElementById("recentRecordsContainer");
  if (!container) return;
  container.innerHTML = ""; // Clear previous logs

  if (!logs || logs.length === 0) {
    container.innerHTML =
      "<div class='text-gray-400 text-center'>No records found.</div>";
    return;
  }

  logs.forEach((log) => {
    // Parse date and time
    const dateObj = new Date(log.time.replace(" ", "T"));
    const dateStr = dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Status
    const isLoggedIn = log.log_in == 1;
    const statusClass = isLoggedIn
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
    const statusText = isLoggedIn ? "LOGGED IN" : "LOGGED OUT";

    // Card
    container.innerHTML += `
      <div class="flex items-center justify-between bg-gray-50 rounded p-2 mb-1">
        <div>
          <div class="font-medium">${dateStr}</div>
          <div class="text-xs text-gray-400">${timeStr}</div>
        </div>
        <span class="${statusClass} text-xs font-medium px-3 py-1 rounded-full">${statusText}</span>
      </div>
    `;
  });
}

function fetchLatestAttendanceLog(callback) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/src/core/attendance.php?latest=1", true);

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      let response;
      try {
        response = JSON.parse(this.responseText);
      } catch (e) {
        if (callback) callback(null);
        return;
      }
      if (callback)
        callback(
          response && response.logs && response.logs[0]
            ? response.logs[0]
            : null
        );
    }
  };

  xhttp.send();
}

function showUserInfo() {
  const userId = document.getElementById("userID").value.trim();
  const userInfoName = document.getElementById("userInfoName");
  const userInfoImg = document.getElementById("userInfoImg");
  const displayEmployeeId = document.getElementById("displayEmployeeId");
  const startCaptureBtn = document.getElementById("startCaptureBtn");

  // Always disable the button initially
  startCaptureBtn.disabled = true;

  if (userId === "") {
    userInfoName.textContent = "---- -- -----";
    userInfoImg.src = "/res/icons/placeholder.jpg";
    displayEmployeeId.textContent = "---- -- -----";
    return;
  }

  // Show loading state
  userInfoName.textContent = "Loading...";
  userInfoImg.src = "/res/icons/placeholder.jpg";
  displayEmployeeId.textContent = "Loading...";

  // Fetch user info from the server
  fetch(`/src/core/userinfo.php?employee_id=${encodeURIComponent(userId)}`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0 && data[0].fullname) {
        userInfoName.textContent = data[0].fullname;
        displayEmployeeId.textContent = data[0].employee_id;
        startCaptureBtn.disabled = false;
      } else {
        userInfoName.textContent = "---- -- -----";
        userInfoImg.src = "/res/icons/placeholder.jpg";
        displayEmployeeId.textContent = "---- -- -----";
        startCaptureBtn.disabled = true;
      }
    })
    .catch(() => {
      userInfoName.textContent = "---- -- -----";
      userInfoImg.src = "/res/icons/placeholder.jpg";
      displayEmployeeId.textContent = "---- -- -----";
      startCaptureBtn.disabled = true;
    });
}

// Clear the field and info on page load
window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("userID").value = "";
  showUserInfo();
});
