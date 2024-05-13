document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Assuming you have the studentId available, replace '123' with the actual studentId
    const studentId = studentData.id;
    //   console.log(studentId);

    // Fetch attendance data from the backend
    const response = await fetch(`/student/${studentId}/attendance`);
    const data = await response.json();
    console.log(data);
    // Display the attendance data on load
    // displayAttendance(data.attendance);
    const attendanceData = data.attendance.map((item) => ({
      subject: item.subject,
      attendedclasses: item.attendedclasses,
      attendancedates: item.attendancedates,
    }));

    const totalClassesData = data.totalClasses.map((item) => ({
      subject: item.subject,
      total_days: item.total_days,
    }));
    const attendanceTableBody = document.getElementById(
      "attendance-table-body"
    );
    attendanceData.forEach((item) => {
      const row = `<tr>
                      <td>${item.subject}</td>
                      <td>${item.attendedclasses}</td>
                      <td>${item.attendancedates.join(", ")}</td>
                    </tr>`;
      attendanceTableBody.innerHTML += row;
    });
    const attendancePercentage = attendanceData.map((item) => {
      const attendedClasses = parseInt(item.attendedclasses);
      const totalClasses =
        totalClassesData.find((totalItem) => totalItem.subject === item.subject)
          ?.total_days || 0;

      // Ensure totalClasses is not zero to avoid division by zero
      const percentage =
        totalClasses !== 0 ? (attendedClasses / totalClasses) * 100 : 0;
      console.log("attened classes: ", attendedClasses);
      console.log("total classes: ", totalClasses);
      console.log("percentage: ", percentage);
      return percentage.toFixed(2); // Round to two decimal places
    });

    // Display total classes data in the table
    const totalClassesTableBody = document.getElementById(
      "total-classes-table-body"
    );
    totalClassesData.forEach((item) => {
      const row = `<tr>
                    <td>${item.subject}</td>
                    <td>${item.total_days}</td>
                  </tr>`;
      totalClassesTableBody.innerHTML += row;
    });

    const subjectDetailsList = document.getElementById("subject-details-list");
    const subjectIcons = {
      Math: "fas fa-calculator",
      Physics: "fas fa-atom",
      Chemistry: "fas fa-flask",
      English: "fas fa-book",
      Biology: "fas fa-microscope",
      // Add more subjects and corresponding icons as needed
    };
    attendanceData.forEach((item) => {
      const attendedClasses = parseInt(item.attendedclasses);
      const totalClasses =
        totalClassesData.find((totalItem) => totalItem.subject === item.subject)
          ?.total_days || 0;
      const percentage =
        totalClasses !== 0
          ? ((attendedClasses / totalClasses) * 100).toFixed(2)
          : 0;

      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <div class="subject-details-div">
          <div class="icons>
              <i class="${subjectIcons[item.subject] || "fas fa-question"}"></i>
          </div>
          <div class="details">
            <h3>Subject: ${item.subject}</h3>
            <p>Attended Classes: ${attendedClasses}</p>
            <p>Total Classes: ${totalClasses}</p>
            <p>Percentage: ${percentage}%</p>
          </div>
        </div>
        `;

      subjectDetailsList.appendChild(listItem);
    });

    // Prepare data for the attendance chart
    const attendanceChartLabels = attendanceData.map((item) => item.subject);
    const attendanceChartValues = attendanceData.map(
      (item) => item.attendedclasses
    );

    // Generate random colors for each subject
    const getRandomColor = () =>
      `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    const attendanceChartColors = attendanceData.map(() => getRandomColor());

    // Display attendance chart
    const ctx = document.getElementById("attendance-chart").getContext("2d");
    const attendanceChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: attendanceChartLabels,
        datasets: [
          {
            label: "Percentage",
            data: attendancePercentage,
            backgroundColor: attendanceChartColors,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const percentage = attendancePercentage[context.dataIndex];
                return `Attended: ${context.parsed.y} - Percentage: ${percentage}%`;
              },
            },
          },
        },
        barPercentage: 0.8, // Adjust this value to control the width of the bars
        categoryPercentage: 0.7,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    // Handle error scenarios
  }
});

//     const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', options); // Use 'en-GB' for DD-MM-YYYY format
// }

//   // Function to display attendance data in the container
//   function displayAttendance(attendanceData) {
//     const attendanceContainer = document.getElementById('attendanceContainer');

//     // Clear previous content in the container
//     attendanceContainer.innerHTML = '';

//     // Check if there is attendance data to display
//     if (attendanceData && attendanceData.length > 0) {
//         const table = createAttendanceTables(attendanceData);
//         attendanceContainer.appendChild(table);
//     } else {
//       // If no attendance data is available, display a message
//       const noAttendanceMessage = document.createElement('p');
//       noAttendanceMessage.textContent = 'No attendance data available.';
//       attendanceContainer.appendChild(noAttendanceMessage);
//     }
//   }

// Function to display student attendance details
function displayStudentAttendanceDetails(studentData) {
  const attendanceDetailsContainer = document.getElementById(
    "attendanceDetailsContainer"
  );

  // Clear previous content in the container
  attendanceDetailsContainer.innerHTML = "";

  // Check if there is attendance data to display
  if (studentData && studentData.attendance) {
    const totalClasses = studentData.totalClasses || 0;
    const attendedClasses = studentData.attendedClasses || 0;
    const percentage = studentData.percentage || 0;

    // Create a div to hold the details
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("attendance-details");

    // Add icons and text
    detailsDiv.innerHTML = `
            <div class="detail">
                <i class="fas fa-calendar"></i>
                <span>Total Classes: ${studentData.attendance.totalClasses}</span>
            </div>
            <div class="detail">
                <i class="fas fa-check-circle"></i>
                <span>Attended Classes: ${studentData.attendance.attendedClasses}</span>
            </div>
            <div class="detail">
                <i class="fas fa-percent"></i>
                <span>Attendance Percentage: ${studentData.attendance.percentage}%</span>
            </div>
        `;

    // Append the details to the container
    attendanceDetailsContainer.appendChild(detailsDiv);
  } else {
    // If no attendance data is available, display a message
    const noAttendanceMessage = document.createElement("p");
    noAttendanceMessage.textContent = "No attendance data available.";
    attendanceDetailsContainer.appendChild(noAttendanceMessage);
  }
}

displayStudentAttendanceDetails(studentData);
