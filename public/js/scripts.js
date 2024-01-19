var scatterDataPoints; // Declare scatterDataPoints outside the initializePage function

var scatterData = {
    datasets: [
        {
            label: "Traffic Data (car nr/hour)",
            data: [],  // This will be populated later
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            pointRadius: 8,
        },
    ],
};

document.getElementById('hexagon').addEventListener('click', function() {
    alert('Led activated!');

    // Send a request to the server when the button is clicked
    fetch('/toggleLED', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Log the response from the server
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
    });
});

async function fetchDatasheetContent() {
    try {
        const response = await fetch('/csvData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvData = await response.text();
        // Parse CSV data (you may use a CSV parsing library or implement your own logic)
        // For simplicity, splitting by line and then by comma is shown here
        const rows = csvData.split('\n');
        const datasheetContent = rows.map(row => {
            const columns = row.split(',');
            return {
                x: parseFloat(columns[0]), 
                y: parseFloat(columns[1]),
                z: parseFloat(columns[2]),
                w: parseFloat(columns[3]),
            };
        });
        return datasheetContent;
    } catch (error) {
        console.error('Error fetching datasheet content:', error);
        return [];
    }
}

async function fetchStaticTraffic(selectedHour) {
    try {
        const response = await fetch('/staticCsvData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvData = await response.text();
        // Parse CSV data (you may use a CSV parsing library or implement your own logic)
        // For simplicity, splitting by line and then by comma is shown here
        const rows = csvData.split('\n');
        const selectedRow = rows.find(row => {
            const columns = row.split(',');
            // the first column represents hours (timestamps)
            return parseFloat(columns[0]) === selectedHour;
        });

        if (!selectedRow) {
            console.log(`No data found for hour ${selectedHour}`);
            return null;
        }

        const columns = selectedRow.split(',');
        const selectedValue = parseFloat(columns[1]); // second column holds the desired value

        return selectedValue;
    } catch (error) {
        console.error('Error fetching datasheet content:', error);
        return null; 
    }
}


document.addEventListener("DOMContentLoaded", function () {
    async function initializePage() {
        try {
            // Fetch datasheet content from CSV file
            scatterDataPoints = await fetchDatasheetContent(); 

            // Update scatterData with the fetched data
            scatterData.datasets[0].data = scatterDataPoints;

            // Get the canvas element
            var ctx = document.getElementById("trafficChart").getContext("2d");

            // Create a scatter plot
            var scatterChart = new Chart(ctx, {
                type: "scatter",
                data: scatterData,
                options: {
                    scales: {
                        x: {
                            min: 0,
                            max: 23,
                            type: 'linear',
                            position: 'bottom'
                        },
                        y: {
                            min: 0
                        }
                    }
                }
            });

            // Display datasheet content initially
            displayDatasheetContentInTable(scatterDataPoints);

            // Populate the selectHours dropdown
            populateHoursDropdown();

        } catch (error) {
            console.error('Error during page initialization:', error);
        }
    }
    initializePage();

    function displayDatasheetContentInTable(datasheetContent) {
        const tableElement = document.getElementById('datasheet');
        tableElement.innerHTML = ''; // Clear previous content

        if (datasheetContent.length === 0) {
            tableElement.textContent = 'No datasheet content available.';
            return;
        }

        // Create table header
        const headerRow = document.createElement('tr');
        const xHeader = document.createElement('th');
        const yHeader = document.createElement('th');
        const zHeader = document.createElement('th');
        const wHeader = document.createElement('th');

        xHeader.textContent = 'Timestamp';
        yHeader.textContent = 'Nr. of vehicles';
        zHeader.textContent = 'Nr. of cars';
        wHeader.textContent = 'Nr. of trucks';

        headerRow.appendChild(xHeader);
        headerRow.appendChild(yHeader);
        headerRow.appendChild(zHeader);
        headerRow.appendChild(wHeader);

        tableElement.appendChild(headerRow);

        // Add rows to the table
        datasheetContent.forEach(row => {
            const rowElement = document.createElement('tr');
            const xCell = document.createElement('td');
            const yCell = document.createElement('td');
            const zCell = document.createElement('td');
            const wCell = document.createElement('td');

            xCell.textContent = row.x;
            yCell.textContent = row.y;
            zCell.textContent = row.z;
            wCell.textContent = row.w;

            rowElement.appendChild(xCell);
            rowElement.appendChild(yCell);
            rowElement.appendChild(zCell);
            rowElement.appendChild(wCell);

            tableElement.appendChild(rowElement);
        });
    }

    function populateHoursDropdown() {
        const selectHours = document.getElementById('selectHours');
    
        // Create a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = ''; // Set the value to an empty string or any default value you prefer
        defaultOption.textContent = 'Select an hour'; // Set the display text for the default option
        selectHours.appendChild(defaultOption);
    
        // Populate the remaining options
        for (let i = 0; i < 24; i++) {
            let option = document.createElement('option');
            option.value = i;
            option.textContent = i + ":00";
            selectHours.appendChild(option);
        }
    }
    

    function togglePlot() {
        var checkbox = document.getElementById('togglePlot');
        var plot = document.getElementById('trafficPlot');
        var datasheet = document.getElementById('datasheet');

        if (checkbox.checked) {
            plot.style.display = 'block';
            datasheet.style.display = 'none';
        } else {
            plot.style.display = 'none';
            datasheet.style.display = 'block';
            // You can add logic here to populate and display datasheet content
            displayDatasheetContentInTable(scatterDataPoints);
        }
    }

    document.getElementById('togglePlot').addEventListener('change', togglePlot);

    function updateTrafficLevelColor(level, selector) {
        // Remove existing color classes
        var trafficLevelElement = document.getElementById(selector);
        trafficLevelElement.classList.remove('low', 'medium', 'high');
        
        // Add the corresponding color class
        trafficLevelElement.classList.add(level);
    }

    // Assuming you have a dropdown with id "selectHours" in your HTML
    const selectHours = document.getElementById('selectHours');

    selectHours.addEventListener('change', async function() {
        const selectedHour = parseFloat(selectHours.value);
        const trafficSize = await fetchStaticTraffic(selectedHour);
        var trafficLevel;

        switch (trafficSize) {
            case 1: {
                updateTrafficLevelColor('low', 'trafficSize');
                trafficLevel = "LIGHT";
            }
            break;
            case 2:{
                trafficLevel = 'MEDIUM';
                updateTrafficLevelColor('medium', 'trafficSize');
            }
            break;
            case 3: {
                trafficLevel = 'HIGH';
                updateTrafficLevelColor('high', 'trafficSize');
            }
            break;
            default:
                trafficLevel = "Unknown Traffic";
        }
        document.getElementById('trafficSize').textContent = trafficLevel;
    });

    async function fetchWeather() {
        try {
            const response = await fetch('/weather');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const weatherData = await response.json();
            return weatherData.message; // Assuming the weather data contains a "message" property
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return 'Error fetching weather'; // Provide a default message or handle the error accordingly
        }
    }
    async function updateWeather() {
        try {
            const weatherMessage = await fetchWeather();
            document.getElementById('currentWeather').textContent = weatherMessage;
        } catch (error) {
            console.error('Error updating weather:', error);
        }
    }

    async function fetchCurrentTraffic() {
        try {
            const response = await fetch('/currentTraffic');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const trafficData = await response.json();
            return trafficData.message; // Assuming the traffic data contains a "message" property
        } catch (error) {
            console.error('Error fetching traffic data:', error);
            return 'Error fetching traffic'; // Provide a default message or handle the error accordingly
        }
    }
    
    async function updateCurrentTraffic() {
        try {
            const numberOfCars = await fetchCurrentTraffic();
            let trafficSize = 0
            if (numberOfCars <= 1) {
                trafficSize = 1
            } else {
                if (numberOfCars > 1 && numberOfCars < 3) {
                    trafficSize = 2
                } else {
                    trafficSize = 3
                }
            }

            var trafficLevel;
            switch (trafficSize) {
                case 1: {
                    updateTrafficLevelColor('low', 'trafficLevel');
                    trafficLevel = "LIGHT";
                }
                break;
                case 2:{
                    trafficLevel = 'MEDIUM';
                    updateTrafficLevelColor('medium', 'trafficLevel');
                }
                break;
                case 3: {
                    trafficLevel = 'HIGH';
                    updateTrafficLevelColor('high', 'trafficLevel');
                }
                break;
                default:
                    trafficLevel = "Unknown Traffic";
            }
            document.getElementById('trafficLevel').textContent = trafficLevel;

        } catch (error) {
            console.error('Error updating weather:', error);
        }
        
    }

    // setInterval(updateWeather, 5000); 
    setInterval(updateCurrentTraffic, 5000); 
});
