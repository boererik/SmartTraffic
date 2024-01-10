import http from "http";
import got from "got";

let messageContent = "";

http.createServer(myServer).listen(8686);

function myServer(req, resp) {
    getTemperatureFromOW().then(intermediateWrapper(resp))
}

function getTemperatureFromOW() {
  const myKey = "fc90365f8471c97e12b4f30d70258384";
  const city = "Cluj-Napoca,RO";
  const address =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    myKey +
    "&units=metric";
  const responseData = got(address).json();
  return responseData
}

function intermediateWrapper(myResponse) {
  function showPage(gotResponse) {
    let tempUrl = gotResponse.data[0].url; // This line might not be correct, as the structure of the response might differ
    let headers = { "Content-Type": "text/html" };
    myResponse.writeHead(200, headers); // Fixing the method name
    myResponse.end(messageContent); // Sending the response
  }
  return showPage;
}
