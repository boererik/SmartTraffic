var scatterDataPoints; 

var scatterData = {
    datasets: [
        {
            label: "Traffic Data (vehicle nr/hour)",
            data: [], 
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            pointRadius: 8,
        },
    ],
};

document.getElementById('hexagon').addEventListener('click',async function() {
    alert('Led activated!');

    await fetch('/toggleLED', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); 
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
 
        const rows = csvData.split('\n');
        const datasheetContent = rows.map(row => {
            const columns = row.split(',');
            return {
                x: parseFloat(columns[0]), 
                y: parseFloat(columns[1]),
            };
        });

        const filteredData = datasheetContent.slice(0, -1);
        const validData = filteredData.filter(row => !isNaN(row.y));

        const aggregatedData = validData.reduce((result, { x, y }) => {
            if (!result[x]) {
                result[x] = { sum: 0, count: 0 };
            }
            result[x].sum += y;
            result[x].count += 1;
            return result;
        }, {});

        const finalResult = Object.keys(aggregatedData).map(x => ({
            x: parseFloat(x),
            y: aggregatedData[x].sum / aggregatedData[x].count,
        }));

        return finalResult;
    } catch (error) {
        console.error('Error fetching datasheet content:', error);
        return [];
    }
}


async function fetchStaticTraffic(selectedHour) {
    try {
        const response = await fetchDatasheetContent();
        const dataArray = response;
        const selectedObject = dataArray.find(obj => {
            return parseFloat(obj.x) === selectedHour;
        });

        if (!selectedObject) {
            console.log(`No data found for hour ${selectedHour}`);
            return null;
        }

        const selectedValue = parseFloat(selectedObject.y);

        return selectedValue;
    } catch (error) {
        console.error('Error fetching datasheet content:', error);
        return null;
    }
}



document.addEventListener("DOMContentLoaded", function () {
    async function initializePage() {
        try {
            scatterDataPoints = await fetchDatasheetContent(); 
            scatterData.datasets[0].data = scatterDataPoints;

            var ctx = document.getElementById("trafficChart").getContext("2d");

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

            displayDatasheetContentInTable(scatterDataPoints);
            populateHoursDropdown();

        } catch (error) {
            console.error('Error during page initialization:', error);
        }
    }
    initializePage();

    function displayDatasheetContentInTable(datasheetContent) {
        const tableElement = document.getElementById('datasheet');
        tableElement.innerHTML = '';

        if (datasheetContent.length === 0) {
            tableElement.textContent = 'No datasheet content available.';
            return;
        }

        const headerRow = document.createElement('tr');
        const xHeader = document.createElement('th');
        const yHeader = document.createElement('th');


        xHeader.textContent = 'Timestamp';
        yHeader.textContent = 'Nr. of vehicles';


        headerRow.appendChild(xHeader);
        headerRow.appendChild(yHeader);


        tableElement.appendChild(headerRow);

        datasheetContent.forEach(row => {
            const rowElement = document.createElement('tr');
            const xCell = document.createElement('td');
            const yCell = document.createElement('td');

            xCell.textContent = row.x;
            yCell.textContent = row.y;

            rowElement.appendChild(xCell);
            rowElement.appendChild(yCell);

            tableElement.appendChild(rowElement);
        });
    }

    function populateHoursDropdown() {
        const selectHours = document.getElementById('selectHours');
        const defaultOption = document.createElement('option');

        defaultOption.value = ''; 
        defaultOption.textContent = 'Select an hour'; 
        selectHours.appendChild(defaultOption);
    
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
            displayDatasheetContentInTable(scatterDataPoints);
        }
    }

    document.getElementById('togglePlot').addEventListener('change', togglePlot);

    function updateTrafficLevelColor(level, selector) {
        var trafficLevelElement = document.getElementById(selector);
        trafficLevelElement.classList.remove('low', 'medium', 'high');
        
        trafficLevelElement.classList.add(level);
    }

    const selectHours = document.getElementById('selectHours');

    selectHours.addEventListener('change', async function() {
        const selectedHour = parseFloat(selectHours.value);
        const numberOfCars = await fetchStaticTraffic(selectedHour);
        
        let trafficSize = 0
        if (numberOfCars <= 1) {
            trafficSize = 1
        } else {
            if (numberOfCars > 1 && numberOfCars < 4) {
                trafficSize = 2
            } else {
                trafficSize = 3
            }
        }

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
            return weatherData.message; 
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return 'Error fetching weather'; 
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
            return trafficData.message; 
        } catch (error) {
            console.error('Error fetching traffic data:', error);
            return 'Error fetching traffic';
        }
    }
    
    async function updateCurrentTraffic() {
        try {
            const numberOfCars = await fetchCurrentTraffic();
            let trafficSize = 0
            if (numberOfCars <= 1) {
                trafficSize = 1
            } else {
                if (numberOfCars > 1 && numberOfCars < 4) {
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

    setInterval(updateWeather, 60000)

    setInterval(updateCurrentTraffic, 5000); 
});
