'use strict';

const recipeId = "45863652";
const recipeKey = "399ed1fed03e519081bace46986bf4e1";
const recipeUrl = "https://api.edamam.com/search";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const weatherKey = "20b505fe4a205d936679c559c49a4b31";
const hot = 86;
const cold = 50;
let foodSet = 0;
let weatherId = 800;
let totalCal = 0;
let foodCal = [];
let getWeather = false;
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

  return queryItems.join('&');
}

// temperture converter 
function KtoF(temperture) {
  return ((temperture - 273.15) * 9 / 5) + 32;
}

// generate one meal for the meal list 
function makeMeal(responseJson) {
  const cal = (responseJson.recipe.calories / responseJson.recipe.yield).toFixed(2);
  totalCal += parseFloat(cal);
  foodCal.push(cal);
  
  return `<li class="item">
    <div class="food-info">
    <h3>${responseJson.recipe.label}</h3>
    <img src=${responseJson.recipe.image} alt=${responseJson.recipe.source}>
    </div>
    <div class="recipe">
    <a class="recipe-link" target="_blank" href=${responseJson.recipe.shareAs}>recipe</a>
    
    <p> calories: <span class="calor" style="color: red">${cal}</span> kcal</p>
    <button class="js-remove">remove</button>
    </div>
  </li>
  `
}


function displayResults(responseJson) {
  
  // add meal to meal list
  $("#meal-list").append(makeMeal(responseJson));

  $(".meal-plan").show();

}

// display the weather section
function displayWeather(responseJson) {
  // stop if their is error occurs during weather api fetch
  if (!getWeather) {
    return;
  }

  
  const temperture = KtoF(responseJson.main.temp).toFixed(2);
  const tempMax = KtoF(responseJson.main.temp_max).toFixed(2);
  const tempMin = KtoF(responseJson.main.temp_min).toFixed(2);
  const windSpeed = responseJson.wind.speed;
  const weatherSatuas = responseJson.weather[0].main;
  const cityName = responseJson.name;
  const wIcon = `http://openweathermap.org/img/wn/${responseJson.weather[0].icon}@2x.png`;
  weatherId = parseInt(responseJson.weather[0].id / 10);
  // update the pointer to locate the meal search keyword in data.js
  if (weatherId === 80) {
    weatherId = responseJson.weather[0].id;
  }

  if (temperture <= cold) {
    foodSet = 0;
  } else if (temperture >= hot) {
    foodSet = 2;
  } else {
    foodSet = 1;
  }
  // enable the display for weather and add the result
  $('.display-weather').show();
  $('#result-weather').append(`<img src=${wIcon} >
  <div id="weather-status">The weather condiation of <b>${cityName}</b> is:<b>${weatherSatuas}</b>"</div> 
  <p>The average temperature is ${temperture}${String.fromCharCode(176)}f</p> <p>From the minimum temperature ${tempMin}${String.fromCharCode(176)}f to maximum ${tempMax}${String.fromCharCode(176)}f</p>
  `);
}

//fetch from the food recipe api 
function seekFood(target, cal) {
  
  const params = {
    q: target,
    app_id: recipeId,
    app_key: recipeKey,
  };
  if (cal != "") {
    params.calories = cal;
  }

  const queryString = formatQueryParams(params)
  const url = recipeUrl + '?' + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson.hits[makeUp(responseJson.hits.length)]))
    .catch(err => {
      $('#js-error-message-food').text(`Something went wrong: ${err.message}`);
    });
}

// locate the weather condition category in data.js
function findId(id) {
  console.log("the id is " + id);
  for (let i = 0; i < MealPlan.length; i++) {
    if (MealPlan[i].id === id) {
      return MealPlan[i];
    }
  }
}

// get random number
function makeUp(n) {
  return Math.floor(Math.random() * n);
}

// search for the meal-plan by search weather condition first and after an short delay search meal-plan base on the result from weather
function getPlan(mainMeal, city) {
  checkWeather(city);
  setTimeout(function () {
    
    if (!getWeather) return -1;
    const sub_meal = SubMeal[foodSet][makeUp(SubMeal[foodSet].length)];
    const fruit = Fruit[foodSet][makeUp(Fruit[foodSet].length)];
    const veg = Vegetable[foodSet][makeUp(Vegetable[foodSet].length)];
    const nut = Nuts[makeUp(Nuts.length)];
    const mealPlan = findId(weatherId);
    const cals = mealPlan.calories;
    const wsug = mealPlan.description;
    $('#result-weather').append(`<p>Friendly suggestion: ${wsug}`);
    console.log(cals);
    $("#meal-list").empty();
    if (mainMeal == "") {
      seekFood(SubMeal[foodSet][makeUp(SubMeal[foodSet].length)], cals[0]);
    } else {
      seekFood(mainMeal, cals[0]);
    }
     seekFood(sub_meal, cals[1]);
     seekFood(fruit, cals[2]);
     seekFood(veg, cals[3]);
    
  }, 800);


}

// fetch weather infomation
function checkWeather(city) {
  const cparams = {
    q: city,
    appid: weatherKey,
  };
  const cqueryString = formatQueryParams(cparams)
  const curl = weatherUrl + '?' + cqueryString;


  

  fetch(curl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log(response.statusText);
      throw new Error(response.statusText);
    })
    .then(function (responseJson) { getWeather = true; displayWeather(responseJson); })
    .catch(err => {
      $('#js-error-message-weather').text(`Something went wrong: city ${err.message}, please check your spell and the space between words`);

    });

}



function openForm() {
  document.getElementById("add-meal-container").style.display = "block";
}

function closeForm() {
  document.getElementById("add-meal-container").style.display = "none";
}
// handle the add another meal button to add another meal to the meal list
function watchAddMeal() {
  $('#submit-add-meal').submit(event => {
    event.preventDefault();
    const mealName = $('#add-meal').val();
    const cal = $('#add-calories').val();
    const excluded = $('#add-excluded').val();
  

    const params = {
      q: mealName,
      app_id: recipeId,
      app_key: recipeKey,
    };
    if (cal != "") {
      params.calories = cal;
    }
    if (excluded != "") {
      params.excluded = excluded;
    }
    
    const queryString = formatQueryParams(params)
    const url = recipeUrl + '?' + queryString;

    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayResults(responseJson.hits[makeUp(responseJson.hits.length)]))
      .catch(err => {
        $('#js-error-message-food').text(`Something went wrong: ${err.message}`);
      });
    closeForm();
  });
}

// remove meal from the meal list, and return to original form if the meal list is empty
function handleRemove() {
  $('#meal-list').on('click', '.js-remove', function (event) {
    totalCal -= parseFloat($(this).closest('li').find('.calor').text());
    
    $(this).closest('li').remove();
    if($('#meal-list li').length == 0){
      $('.display').hide();
      $('#search-meal').removeClass('form-container2');
      $('#search-meal').addClass('form-container');
      $('#intro').show();
    }
    
  });
}
function handleAnalyze(){
  $('.meal-plan').on('click','#analyze', function (event){
    updateCal();
  })
}

function updateCal() {
  $("#total-cal").text(`total calories: ${totalCal.toFixed(2)} kcal`);
}

// main function
function watchForm() {
  $('#search-meal').submit(event => {
    event.preventDefault();
    $('#result-weather').empty();
    $('#js-error-message-food').empty();
    $('#js-error-message-weather').empty();
    $('#search-meal').removeClass('form-container');
    $('#search-meal').addClass('form-container2');
    $('#intro').hide();
    $('.display').show();
    const mainMeal = $('#js-main-meal').val();
    const searchCity = $('#js-city').val();
    console.log("main meal: " + mainMeal);
    getPlan(mainMeal, searchCity);
    getWeather = false;
  });
  handleRemove();
  handleAnalyze();
}

$(watchForm);
$(watchAddMeal);
