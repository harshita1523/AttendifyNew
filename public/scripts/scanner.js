fetch("/students")
  .then((response) => response.json())
  .then((students) => {
    const tableBody = document.getElementById("studentsTableBody");
    id = 1;
    students.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${id}</td>
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td>${student.email}</td>
                
                <td>
                <button class="registration-toggle-btn" data-id="${student.id}">
                ${student.status ? "Registered" : "Register"}
                </button>
                </td>
                <td>
                <button class="registration-delete-btn" data-id="${student.id}">
                 Delete
                </button>
                </td>
                
                `;
      // <td>
      //     <input type="checkbox" class="bulkCheckbox">
      // </td>
      tableBody.appendChild(row);
      id++;
    });
    const deleteButtons = document.querySelectorAll(".registration-delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const userIdToDelete = button.getAttribute("data-id");
        // console.log(userIdToDelete); // Replace with the actual user ID you want to delete
        const endpoint = `/students/${userIdToDelete}`;

        const requestData = {
          method: "DELETE",
        };

        try {
          const response = await fetch(endpoint, requestData);
          const data = await response.json();
          console.log("User deletion response:", data);
          location.reload();
          // const deletedRow = document.getElementById(`user-${userIdToDelete}`);
          // deletedRow.remove();
          // Handle response from the backend if needed
        } catch (error) {
          console.error("Error deleting user:", error);
          console.error("Error details:", error.message); // Additional error logging
          // Handle error scenarios
        }
        // Handle error scenarios
      });
    });

    const toggleButtons = document.querySelectorAll(".registration-toggle-btn");

    toggleButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const studentId = button.getAttribute("data-id");

        try {
          const response = await fetch(`/api/registerStudent/${studentId}`, {
            method: "PUT",
          });

          if (response.ok) {
            // If the response is successful (status 200-299),
            // update the button text or perform other actions
            button.textContent = "Registered"; // For example, change button text
            // Additional logic based on registration success
          } else {
            // Handle unsuccessful response
            console.error("Registration failed");
          }
        } catch (error) {
          console.error("Error registering student:", error);
        }
      });
    });
  })
  .catch((error) => console.error("Error fetching data:", error));

document.addEventListener("DOMContentLoaded", function () {
  const attendanceSection = document.querySelector(".attendance-section");
  const scannerCard = document.getElementById("scannerCard");
  const registrationSection = document.querySelector(".registration-section");
  const scannerSection = document.querySelector(".scanner-section");
  const video = document.getElementById("video");
  const registerCard = document.querySelector(".register-card");
  let activeScanner = false;

  registerCard.addEventListener("click", function () {
    // Hide other sections and display the registration section
    scannerSection.style.display = "none";
    attendanceSection.style.display = "none";
    registrationSection.style.display = "block";

    if (activeScanner) {
      // Stop the camera feed when switching away from the scanner
      video.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      activeScanner = false;
    }
  });

  scannerCard.addEventListener("click", function () {
    // Hide other sections and show the scanner section
    registrationSection.style.display = "none";
    attendanceSection.style.display = "none";
    scannerSection.style.display = "block";
    activeScanner = true;
  });

  const attendanceCard = document.getElementById("attendanceCard");
  attendanceCard.addEventListener("click", function () {
    registrationSection.style.display = "none";
    scannerSection.style.display = "none";
    attendanceSection.style.display = "block";

    if (activeScanner) {
      // Stop the camera feed when switching away from the scanner
      video.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      activeScanner = false;
    }
  });
});
function handleQRCodeScan(scannedData, subject) {
  // const date = new Date().toISOString().split('T')[0];
  // Example subject

  const attendanceData = {
    id: scannedData,
    // name: scannedData.name,
    // date: date,
    subject: subject,
    status: "present", // Example status
  };

  // Make a POST request to your backend endpoint to add attendance
  fetch("/addAttendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scannedData: attendanceData }),
  })
    .then((response) => {
      if (response.ok) {
        showNotification("Attendnace marked!");
        console.log("Attendance added successfully.");
        // Handle success, if needed
      } else {
        // console.log(scannedData,subject);
        // console.log(scannedData.id);
        // console.log(scannedData.name);
        showNotification("Already marked!", "danger");
        // alert("Already marked!")
        console.error("Error adding attendance.");
        // Handle error response, if needed
      }
    })
    .catch((error) => {
      console.error("Error adding attendance:", error);
      // Handle any fetch errors, if needed
    });
}
async function startScanner(subject, isScannerActive) {
  try {
    if (!isScannerActive) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", function () {
        // Video is ready, now play it
        video.play();
      });

      const scanner = new Instascan.Scanner({ video: video });
      const cameras = await Instascan.Camera.getCameras();
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
        // scannerSection.style.display = 'block';

        scanner.addListener("scan", function (content) {
          document.getElementById("scannedData").textContent = content;
          console.log("Scanned:", content);
          handleQRCodeScan(content, subject);
          // scanner.stop();
        });
      } else {
        console.error("No cameras found.");
      }
      isScannerActive = true;
    }
  } catch (err) {
    console.error("Error accessing camera:", err);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");
  // const pauseButton = document.getElementById('pauseButton');
  // const resumeButton = document.getElementById('resumeButton');
  const endClassButton = document.getElementById("endClassButton");
  const subjectDropdown = document.getElementById("subjectDropdown");

  let scannerInstance;
  let isPaused = false;
  let isScannerActive = false;
  let selectedSubject = subjectDropdown.value;
  // Event listener for the 'Start Scanning' button
  startButton.addEventListener("click", function () {
    selectedSubject = subjectDropdown.value; // Get the selected subject from the dropdown
    console.log(selectedSubject);
    if (selectedSubject !== "") {
      startScanner(selectedSubject, isScannerActive);
      scannerInstance = true;
      isScannerActive = true;
    } else {
      console.log("Please select a subject first!");
      alert("'Please select a subject first!'");
    }
  });

  // pauseButton.addEventListener('click', function () {
  //     // pauseCameraAndDisplayMessage(scannerInstance,isPaused);
  //     const video = document.getElementById('video');
  //     if (scannerInstance && !isPaused) {
  //         // Stop the camera feed when switching away from the scanner
  //         video.srcObject.getTracks().forEach(track => {
  //             track.stop();
  //         });
  //         activeScanner = false;
  //         isPaused = true;
  //         isScannerActive = false;

  //     }
  // });

  // // Event listener for the 'Resume Scanning' button
  // resumeButton.addEventListener('click', function () {
  //     console.log(isPaused)
  //     if (isPaused) { // Check if scanner is currently paused
  //         isPaused = false; // Set the resume state
  //         startScanner(isScannerActive); // Restart the scanner
  //     }
  // });
  // endClassButton.addEventListener('click',stopScanning);
  // Event listener for the 'End Class' button
  endClassButton.addEventListener("click", async function () {
    const video = document.getElementById("video");
    if (scannerInstance && !isPaused) {
      // Stop the camera feed when switching away from the scanner
      video.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      activeScanner = false;
      isPaused = true;
    }
    const subjectName = selectedSubject; // Replace 'Maths' with the actual subject name
    console.log(subjectName);
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

    const endpoint = "/faculty";

    const requestData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectName,
        classDate: currentDate,
      }),
    };

    try {
      const response = await fetch(endpoint, requestData);
      const data = await response.json();
      console.log("Data sent to backend:", data);
      location.reload();
      // Handle response from the backend if needed
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // Handle error scenarios
    }
  });
});

// Sample data (replace this with fetched data from the backend)
// const attendanceData = {
//     "students": [
//         {
//             "id": "12345",
//             "name": "abc",
//             "attendance": {
//                 "2024-01-01": "P",
//                 "2024-01-02": "P",
//                 "2024-01-03": "P",
//                 "2024-01-04": "A",
//                 "2024-01-05": "A",
//                 "2024-01-06": "A",
//                 "2024-01-07": "P",
//                 "2024-01-08": "A",
//                 "2024-01-09": "A",
//                 "2024-01-10": "A",
//                 "2024-01-11": "P",
//                 "2024-01-12": "A",
//                 "2024-01-13": "A",
//                 "2024-01-14": "A",
//                 "2024-01-15": "P",
//                 "2024-01-16": "A",
//                 "2024-01-17": "A",
//                 "2024-01-18": "A",
//                 "2024-01-19": "P",
//                 "2024-01-20": "A",
//                 "2024-01-21": "P",
//                 "2024-01-22": "A",
//                 "2024-01-23": "A",
//                 "2024-01-24": "A",
//                 "2024-01-25": "P",
//                 "2024-01-26": "A",
//                 "2024-01-27": "A",
//                 "2024-01-28": "A",
//                 "2024-01-29": "P",
//                 "2024-01-30": "A",
//                 "2024-12-31": "P"
//             }
//         },
//         {
//             "id": "45678",
//             "name": "xyz",
//             "attendance": {
//                 "2024-01-01": "A",
//                 "2024-01-02": "P",
//                 "2024-01-03": "P",
//                 "2024-01-04": "A",
//                 "2024-01-05": "A",
//                 "2024-01-06": "A",
//                 "2024-01-07": "P",
//                 "2024-01-08": "A",
//                 "2024-01-09": "A",
//                 "2024-01-10": "A",
//                 "2024-01-11": "P",
//                 "2024-01-12": "A"
//             }
//         }, {
//             "id": "45678",
//             "name": "lalala",
//             "attendance": {
//                 "2024-01-01": "P",
//                 "2024-01-02": "P",
//                 "2024-01-03": "P",
//                 "2024-01-04": "A",
//                 "2024-01-05": "A",
//                 "2024-01-06": "A",
//                 "2024-01-07": "P",
//                 "2024-01-08": "A",
//                 "2024-01-09": "A",
//                 "2024-01-10": "A",
//                 "2024-01-11": "P",
//                 "2024-01-12": "A"
//             }
//         }, {
//             "id": "45678",
//             "name": "hululu",
//             "attendance": {
//                 "2024-01-01": "P",
//                 "2024-01-02": "P",
//                 "2024-01-03": "P",
//                 "2024-01-04": "P",
//                 "2024-01-05": "A",
//                 "2024-01-06": "A",
//                 "2024-01-07": "P",
//                 "2024-01-08": "A",
//                 "2024-01-09": "A",
//                 "2024-01-10": "A",
//                 "2024-01-11": "P",
//                 "2024-01-12": "A"
//             }
//         }
//     ]
// };

// Function to dynamically create the attendance table
function createAttendanceTable(data) {
  console.log(data);
  const table = document.createElement("table");
  const headerRow = table.insertRow();
  const dates = new Set();

  // Extract unique dates
  data.forEach((student) => {
    if (student.dates && Array.isArray(student.dates)) {
      student.dates.forEach((date) => dates.add(date));
    }
  });
  // console.log(dates);
  // Create table headers for student ID and name
  const srNoHeader = document.createElement("th");
  srNoHeader.textContent = "Sr No";
  headerRow.appendChild(srNoHeader);
  srNoHeader.style.width = "50px";

  const idHeader = document.createElement("th");
  idHeader.textContent = "Student ID";
  headerRow.appendChild(idHeader);
  idHeader.style.width = "250px";

  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Student Name";
  headerRow.appendChild(nameHeader);
  nameHeader.style.width = "250px";

  // Create table headers for dates
  const sortedDates = [...dates].sort();
  sortedDates.forEach((date) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = date;
    headerCell.style.width = "50px";
    headerRow.appendChild(headerCell);
  });

  // Populate the table with student attendance data
  let index = 0;
  data.forEach((student) => {
    const row = table.insertRow();
    const srNoCell = row.insertCell();
    srNoCell.textContent = index + 1;

    const idCell = row.insertCell();
    idCell.textContent = student.id;

    const nameCell = row.insertCell();
    nameCell.textContent = student.name;
    // console.log(student);
    sortedDates.forEach((date) => {
      const cell = row.insertCell();
      // console.log("Date: ",date);

      // const attendanceStatus = student.attendance && student.attendance.hasOwnProperty(date) ? 'P' : 'A';
      const attendanceStatus = student.dates.includes(date) ? "P" : "A";

      cell.textContent = attendanceStatus;

      if (attendanceStatus === "P") {
        cell.style.backgroundColor = "#ccffcc";
        // cell.style.color = 'white';
      } else if (attendanceStatus === "A") {
        cell.style.backgroundColor = "#ffcccc";
        // cell.style.color = 'white';
      }
      // Add more conditions if needed
    });
    index++;
  });

  return table;
}
// document.addEventListener('DOMContentLoaded', function() {

const fetchAttendance = async () => {
  showLoader();
  const container = document.getElementById("attendanceContainer");
  const subject = document.getElementById("subject").value;
  container.innerHTML = "";

  try {
    const response = await fetch(`/attendance/${subject}`);
    console.log(response);
    const data = await response.json();
    //   displayAttendance();

    const attendanceTable = createAttendanceTable(data.students);
    container.appendChild(attendanceTable);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  } finally {
    hideLoader();
  }
  // };
};
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add(`alert-${type}`);
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
    notification.classList.remove(`alert-${type}`);
  }, 3000); // Hide the notification after 3 seconds
}
