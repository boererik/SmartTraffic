import got from "got";

async function getTemperatureFromOW() {
    try {
        const myKey = "fc90365f8471c97e12b4f30d70258384";
        const city = "Athens,GR";
        const address =
          "http://api.openweathermap.org/data/2.5/weather?q=" +
          city +
          "&appid=" +
          myKey +
            "&units=metric";
        //const address1 = "https://api.openweathermap.org/data/3.0/onecall?lat=46.77&lon=23.59&appid=" + myKey
        const responseData = await got(address).json();
        //console.log("Temp: ", responseData.main.temp)
        return responseData.main.temp;
    } catch (error) {
        console.log("Error: ", error)
        throw error;
    }
}

export default getTemperatureFromOW();