import got from "got";

export async function getTemperatureFromOW() {
    try {
        const myKey = "fc90365f8471c97e12b4f30d70258384";
        const city = "Cluj-Napoca,RO";
        const address =
            "http://api.openweathermap.org/data/2.5/weather?q=" +
            city +
            "&appid=" +
            myKey +
            "&units=metric";
        const responseData = await got(address).json();
        return responseData.main.temp;
    } catch (error) {
        console.log("Error: ", error)
        throw error;
    }
}

export function handleTemperatureFromOW(temperature) {
    if (temperature < 0) {
        return 1;
    } else {
        return 0;
    }
}
