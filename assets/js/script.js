var cityFormEl = document.querySelector("#city-form");
var cityInputEl = document.querySelector("#cityname");
var mainCityName = document.querySelector("#main-city");
var todaysDate = document.querySelector("#today");
var mainIconImg = document.querySelector("#mainIcon");
var mainTemp = document.querySelector("#mainTemp");
var mainWind = document.querySelector("#mainWind");
var mainHum = document.querySelector("#mainHum");
var mainUV = document.querySelector("#mainUV");
var cardsContainer = document.querySelector("#card-box");
var historyContainer = document.querySelector("#history-container")

var historyStorage = [];
var counter = 0;


//Save and load search history to localstorage//
var historyEl = function(cityname) {
    var historyText = document.createElement("button");
    historyText.setAttribute("data-history", counter);
    historyText.classList = "container text-center text-xl border p-2 my-3 bg-gray-400 rounded-lg";
    var history = historyText.textContent;
    history = cityname;

    historyText.append(history);        
    historyContainer.append(historyText);
    counter++; 

    historyText.addEventListener("click", historySearch);
}

var historySearch = function(event) {
    var targetObj = event.target.getAttribute("data-history");
    var targetEl = document.querySelector("button[data-history='" + targetObj + "']");
    var targetText = targetEl.textContent;
    
    geoCoding(targetText);

}

var historySaver = function(history) {
    historyStorage.push(history);
    localStorage.setItem("history", JSON.stringify(historyStorage)); 
    
}

var loadHistory = function() {
    
    var savedHistory = localStorage.getItem("history");
                   
    if (!savedHistory) {

        return false;        
    } 
    
    savedHistory = JSON.parse(savedHistory);

      for (var i = 0; i < savedHistory.length; i++) {
       
        historyStorage.push(savedHistory[i]);
        historyEl(savedHistory[i]);    
    }   
}
    
// Get geocoding APIs from the website//

var geoCoding = function(cityname) {

    var apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" + cityname + "&units=imperial&appid=7897375a849d9c573a4059cb85dac036"; 
   
    fetch(apiUrl).then(function(response) {

        if (response.ok) {
            response.json().then(function(data) {

                displayCity(data.name);
                mainWeatherIcon(data.weather[0].icon);
                
                mainTemp.textContent = data.main.temp + " \u00B0F";
                mainWind.textContent = data.wind.speed + " MPH";
                mainHum.textContent = data.main.humidity + " %";
    
                forecastAPI(data.coord.lat, data.coord.lon);  
    
                if (!historyStorage.includes(data.name)) {
                    historyEl(data.name);
                    historySaver(data.name);
                } 
            })
        } else {
            alert("Error: City Not Found");
        }        
    })
    .catch(function(error) {
        alert("Unable to connect to Server");
    })
}

// Get API for the UV index//

var uvDecider = function(index) {

    var uv = index;            
    mainUV.textContent = uv;      
    
    if (uv < 3) {
        mainUV.style.backgroundColor = "#15803d"; 
        
    } else if (uv >=3 && uv < 6) {      
        mainUV.style.backgroundColor = "#a16207";
  
    } else if (uv >=6 && uv < 8) {     
        mainUV.style.backgroundColor = "#c2410c";
     
    } else if (uv >=8 && uv < 11) { 
        mainUV.style.backgroundColor = "#b91c1c";
      
    } else if (uv >= 11) {      
        mainUV.style.backgroundColor = "#6d28d9";
  
    } return;

};

// Send API results to the 5 forecast boxex //

var cardIconSelect = function(result) {
    
    for (var i = 0; i < result.length - 3; i++) {
        iconId = result[i+1].weather[0].icon;

        var dataCard = document.querySelector("div[data-card-container='" + i + "']");
        var cardText = dataCard.querySelector("img");    
        var addIcon = cardText.setAttribute("src", "https://openweathermap.org/img/wn/" + iconId + "@2x.png")
        cardText.textContent = addIcon;
    }    
};

var forecastTemp = function(result) {
                
    for (var i = 0; i < result.length - 3; i++) {
        
        temp = result[i+1].temp.day;
        
        var dataCard = document.querySelector("div[data-card-container='" + i + "']");
        var cardText = dataCard.querySelector("p[id='0']");
        var cardTemp = cardText.textContent;  
        cardText.textContent = "";                  
        cardTemp = "Temp: " + temp + " \u00B0F";
        cardText.append(cardTemp);
    }             
};

var forecastWind = function(result) {
                
    for (var i = 0; i < result.length - 3; i++) {
        wind = result[i+1].wind_speed;

        var dataCard = document.querySelector("div[data-card-container='" + i + "']");
        var cardText = dataCard.querySelector("p[id='1']");
        var cardWind = cardText.textContent;
        cardText.textContent = ""; 
        cardWind = "Wind: " + wind + " MPH";
        cardText.append(cardWind);
    }             
};

var forecastHum = function(result) {
                
    for (var i = 0; i < result.length - 3; i++) {
        hum = result[i+1].humidity;

        var dataCard = document.querySelector("div[data-card-container='" + i + "']");
        var cardText = dataCard.querySelector("p[id='2']");
        var cardHum = cardText.textContent;
        cardText.textContent = ""; 
        cardHum = "Humidity: " + hum + " %";
        cardText.append(cardHum);
    }             
};

var forecastAPI = function(lat, lon) {

    var apiUrl = 
    "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=hourly,minutely,alert&appid=7897375a849d9c573a4059cb85dac036";

    fetch(apiUrl).then(function(response) {
        response.json().then(function(data) {
                        
            uvDecider(data.daily[0].uvi);          
   
            cardIconSelect(data.daily);

            forecastTemp(data.daily);

            forecastWind(data.daily);

            forecastHum(data.daily);
            
        })
    })
};


// Submit event handler//
var formSubmitHandler = function(event) {
    event.preventDefault();

    var cityInput = cityInputEl.value.trim();
    cityInputEl.value = "";
    geoCoding(cityInput);           
}

// Display results to the main container of today's weather//
var currentDate = function() {

    var now = moment().format("(MM/DD/YYYY)");
    todaysDate.textContent = "";
    todaysDate.textContent = now;
    
}

var cardsDate = function() {
    
    for (var i = 0; i < 5; i++) {

        var dateContainer = document.createElement("div");
        dateContainer.classList = "container mx-1 h-auto w-2/3 bg-sky-900 p-1";
        dateContainer.setAttribute("data-card-container", i);
        cardsContainer.append(dateContainer);

        var dateEl = document.createElement("h1");
        dateEl.classList = "text-2xl text-white font-bold leading-loose";
        dateContainer.append(dateEl);

        var datesAhead = moment().add(1+i, "days").format("MM/DD/YYYY");        
        dateEl.textContent = datesAhead;
        
        var cardIcon = document.createElement("img");
        cardIcon.classList = "w-1/3";
        dateContainer.append(cardIcon);
        cardIcon.textContent = "icon";

        for (var j = 0; j < 3; j++) {
            
            var cardsText = document.createElement("p");
            cardsText.classList = "text-xl text-white leading-10";
            cardsText.setAttribute("id", j);
            dateContainer.append(cardsText);                    
        } 
    }   return;
    
}
cardsDate();


var mainWeatherIcon = function(iconNum) {

    mainIconImg.setAttribute("src", "https://openweathermap.org/img/wn/" + iconNum + "@2x.png")
}

var displayCity = function(cityname) {
    
    mainCityName.textContent = cityname;
    currentDate();  
    mainWeatherIcon();

}

// Eventlistener//
loadHistory();
cityFormEl.addEventListener("submit", formSubmitHandler);


