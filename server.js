// const express = require('express');
import express from 'express';
const app = express();
const port = 3000;
// const fetch = require('node-fetch');
// const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let publicPath = path.resolve(__dirname, 'public');
// const axios = require('axios').default;
import fetch from 'node-fetch';

const API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const API_KEY = '3e2d927d4f28b456c6bc662f34350957';


if (!globalThis.fetch) {
	globalThis.fetch = fetch;
}


app.use(express.static(publicPath));
app.get('/weather/:city', getWeather);
app.listen(port, () => console.log(`Weather app listening on port ${port}`));

// api.openweathermap.org/data/2.5/forecast/daily?q=London&units=metric&cnt=7&appid={API key}




function getWeather(req, res) {

    let city = req.params.city;
    let url = `${API_URL}?q=${city}&units=metric&cnt=5&APPID=${API_KEY}`;
    
    let promise = fetch(url);

    promise
        .then(resp => resp.json())
        .then(data => {
            if (data.cod === '404') {
                
                res.json({result: {
                    validCity: false,
                    weatherData: {}
                }});
            } else {
                
                res.json({result: {
                    validCity: true,
                    weatherData: parseWeather(data)
                }});
            }
        })
        .catch(function () {
            res.json({result: {
                validCity: false,
                weatherData: {}
            }});
        });

    promise.catch(function () {
        res.json({result: {
            validCity: false,
            weatherData: {}
        }});
    });

}

function parseWeather(data) {
    console.log('parseWeather called');
    console.log(data);
    // let cityFullName = `${data.city.name}, ${data.city.country}`;
    
    let cityFullName = `${data.city.name}`;
    console.log(cityFullName);
    
    
    let anyRain = false;
    let sumOfTemp = 0;
    let dailyForecast = [];
    let tempRanges = [false, false, false]
    let day=0;
    for (day = 0; day < 5; day++) {
        console.log('B');
        let totalRain = 0;
        let meanTemp = 0;
        let maxWindSpeed = 0;
        
        // 8 3-hour segments per day
        // for (step = 0; step < 8; step++) {
        // let weather = data.list[(day * 8) + step];
        let currDay = data.list[day];
        console.log(currDay);
        let weather = currDay.weather;
        console.log('weather');
        let rainCalc = weather[0];
        console.log(rainCalc);
        if (rainCalc.main=='Rain'){
            let rainLevel = currDay.rain;
            totalRain += rainLevel['3h'];
            console.log('rain true');
            anyRain = true;
        } 
        let mainTemp = currDay.main;
        
        meanTemp = mainTemp.temp;
        console.log('Temperature');
        sumOfTemp +=meanTemp;
        // maxWindSpeed = Math.max(maxWindSpeed, weather.wind.speed);
        
        let wind = currDay.wind;
        console.log(wind.speed);
        maxWindSpeed = wind.speed;
        // }
        dailyForecast.push({
            rain: totalRain.toFixed(2),
            temp: meanTemp.toFixed(1),
            wind: maxWindSpeed.toFixed(2)
        });

        if (meanTemp < 10) tempRanges[0] = true;
        else if (meanTemp > 20) tempRanges[2] = true;
        else tempRanges[1] = true;
        
    }

        
        
        // anyRain = 0;
        
        // if (totalRain > 0) anyRain = true;
       
        console.log(sumOfTemp);
        
        // let avgTemp = sumOfTemp/5.0;
        
        

    console.log(cityFullName);
    console.log(anyRain);
    console.log(tempRanges);
    console.log(dailyForecast);
    return {
        cityFullName: cityFullName,
        anyRain: anyRain,
        tempRanges: tempRanges,
        dailyForecast: dailyForecast
    };
}