'use strict';

const foodId = "49cd00a8";
const foodKey = "6e019ca76216c5932c1163f814648529";
const foodUrl = "https://api.edamam.com/api/food-database/parser";
const recipeId = "45863652";
const recipeKey = "399ed1fed03e519081bace46986bf4e1";
const recipeUrl = "https://api.edamam.com/search";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const weatherKey = "20b505fe4a205d936679c559c49a4b31";
const hot = 86;
const cold = 50;
let foodSet = 0;
let weatherId = 80;
let totalCal = 0;
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  
  return queryItems.join('&');
}

function KtoF(temperture){
  return ((temperture - 273.15)*9/5)+32;
}

function makeMeal(responseJson){
  const cal=responseJson.recipe.calories/responseJson.recipe.yield;
  totalCal += cal;
  console.log(totalCal);
  return `<li>
    <h2>${responseJson.recipe.label}</h2>
    <img src=${responseJson.recipe.image} alt=${responseJson.recipe.source}>
    <div class="recipe">
    <a target="_blank" href=${responseJson.recipe.shareAs}>recipe</a>
    </div>
    <p> calories: ${cal}</p>
    <button class="js-remove">remove</button>
  </li>
  `
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $("#meal-list").append(makeMeal(responseJson));

  $(".meal-plan").removeClass('hidden');
  /*
    name: label
    picuture: image
    recipe: shareAs
    from: source
    calories: calories/yield
    ppl: yield
    weight: totalWeight/yield
    meal plan: vege, fruit, meats, poultry, fish, beans, eggs, and nuts
    calories needs: 1500-1800 women, 2400 man

  */
}

function displayWeather(responseJson){
  console.log(responseJson);
  const temperture = KtoF(responseJson.main.temp).toFixed(2);
  const tempMax = KtoF(responseJson.main.temp_max).toFixed(2);
  const tempMin = KtoF(responseJson.main.temp_min).toFixed(2);
  const windSpeed = responseJson.wind.speed;
  const weatherSatuas = responseJson.weather[0].main;
  const cityName = responseJson.name;
  weatherId = parseInt(responseJson.weather[0].id / 10);
  if(temperture <= cold){
    foodSet = 0;
  } else if(temperture >= hot){
    foodSet = 2;
  } else {
    foodSet = 1;
  }
  //$('#result-weather').empty();
  $('.weather').removeClass('hidden');
  $('#result-weather').text(`City: ${cityName}/  The weather is: ${weatherSatuas}/ The average temperature is ${temperture}${String.fromCharCode(176)}f/ From the minimum temperature ${tempMin}${String.fromCharCode(176)}f to maximum ${tempMax}${String.fromCharCode(176)}f\n`);
  // weather overview: responseJson.weather.main
  // temperture: responseJson.main.temp, temp_min, temp_max
  // wind.speed
}

function seekFood(target, cal){
    console.log(target); 
  const params = {
    q: target,
    app_id : recipeId,
    app_key : recipeKey,
  };
  if(cal != ""){
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

function findId(id){
  for(let i = 0; i < MealPlan.length; i++){
    if(MealPlan[i].id === id){
      return MealPlan[i].calories;
    }
  }
}

function makeUp(n){
  return Math.floor(Math.random()*n);
}

function getPlan(mainMeal,city) {

 
  const cparams = {
    q: city,
    appid : weatherKey,
  };
  const cqueryString = formatQueryParams(cparams)
  const curl = weatherUrl + '?' + cqueryString;


  console.log(curl);

  fetch(curl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log(response.statusText);
      throw new Error(response.statusText);
    })
    .then(responseJson => displayWeather(responseJson))
    .catch(err => {
      $('#js-error-message-weather').text(`Something went wrong: city ${err.message}, please check your spell and the space between words`);
  });

  const sub_meal = SubMeal[makeUp(SubMeal.length)];
  const fruit = Fruit[foodSet][makeUp(Fruit[foodSet].length)];
  const veg = Vegetable[foodSet][makeUp(Vegetable[foodSet].length)];
  const nut = Nuts[makeUp(Nuts.length)];
  const cals = findId(weatherId);
  $("#meal-list").empty();
  if(mainMeal == ""){
    seekFood(SubMeal[makeUp(SubMeal.length)],cals[0]);
  } else{
    seekFood(mainMeal, cals[0]);
  }
  seekFood(sub_meal, cals[1]);
 // seekFood(fruit, cals[2]);
 // seekFood(veg, cals[3]);
 // seekFood(nut, cals[4]);
  
}

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

function watchAddMeal(){
  $('#submit-add-meal').submit(event => {
    event.preventDefault();
    const mealName = $('#add-meal').val();
    const cal = $('#add-calories').val();
    const excluded = $('#add-excluded').val();
    console.log(mealName);
    console.log(cal);
    console.log(excluded);
    
    const params = {
      q: mealName,
      app_id : recipeId,
      app_key : recipeKey,
    };
    if (cal != ""){
      params.calories = cal;
    }
    if (excluded != ""){
      params.excluded = excluded;
    }
    console.log(params);
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
function handleRemove(){
  $('#meal-list').on('click','.js-remove',function(event){
    $(this).closest('li').remove();

  });
}
function updateCal(){
  $("#total-cal").text(`total calories: ${totalCal}`);
}

function watchForm() {
  $('#search-meal').submit(event => {
    event.preventDefault();
    const mainMeal = $('#js-main-meal').val();
    const searchCity = $('#js-city').val();
    getPlan(mainMeal,searchCity);
    updateCal();
  });
  handleRemove();
}
$(watchForm);
$(watchAddMeal);
