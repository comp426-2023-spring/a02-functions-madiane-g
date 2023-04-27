#!/usr/bin/env node
const moment = require('moment-timezone')

const timezone = moment.tz.guess()
let OPT_N=false
let OPT_S=false
let OPT_E=false
let OPT_W=false
//Set verbose var default
let VERBOSE=false
let JSON_ONLY=false

const options = {};
const argv = require('minimist')(process.argv.slice(2))
options.day = 1;
for (var i=2; i<process.argv.length; i+=2) {
  const option = process.argv[i]
  const value = process.argv[i+1]
  let timezone;
  switch (option) {
    case '-h':
      show_help()
      process.exit(0)
    case '-n':
      OPT_N = true
      if (OPT_S == true) {
        console.error("Error: Cannot specify n LATITUDE twice.")
        process.exit(1)
      } else {
        options.latitude = Number(value).toFixed(2)
      }
      break;
    case '-s':
      OPT_S = true
      if (OPT_N == true) {
        console.error("Error: Cannot specify s LATITUDE twice.")
        process.exit(1)
      } else {
        options.latitude = Number(value).toFixed(2)
      }
      break;
    case '-e':
      OPT_E = true
      if (OPT_W == true) {
        console.error("Error: Cannot specify LONGITUDE twice.")
        process.exit(1)
      } else {
        options.longitude = Number(value).toFixed(2)
      }
      break;
    case '-w':
      OPT_W = true
      if (OPT_E == true) {
        console.error("Error: Cannot specify LONGITUDE twice.")
        process.exit(1)
      } else {
        options.longitude = Number(value).toFixed(2)
      }
      break;
    case '-z':
      timezone = value
      break;
    case '-d':
      options.day = Number(value)
      break;
    case '-v':
      VERBOSE=true
      break;
    case '-j':
      JSON_ONLY=true
      break;
  }
}

async function main() {
  let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${options.latitude}&longitude=${options.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=${timezone}`)
  let data = await response.json()
  
  if (JSON_ONLY) {
    if (!options.latitude) {
      console.log("Latitude must be in range")
      process.exit(0)
    }
    if (!options.longitude) {
      console.log("Longitude must be in range")
      process.exit(0)
    }
    console.log(data)
    process.exit(0)
  }
  
  let precip = data.daily.precipitation_hours[options.day]
  let current_time = data.current_weather.time
  let current_temp = data.current_weather.temperature
  let current_wind_speed = data.current_weather.windspeed
  let current_wind_dir = data.current_weather.winddirection
  let weathercode = data.current_weather.weathercode
  let time = data.daily.time[options.day]
  let sunset = data.daily.sunset[options.day]
  let sunrise = data.daily.sunrise[options.day]
  let precip_sum = data.daily.precipitation_sum[options.day]
  let wind_gusts = data.daily.windgusts_10m_max[options.day]
  let wind_dir = data.daily.winddirection_10m_dominant[options.day]
  let wind_speed = data.daily.windspeed_10m_max[options.day]
  let temp_low = data.daily.temperature_2m_min[options.day]
  let current_weathercode = data.daily.weathercode[options.day]
  let temp_high = data.daily.temperature_2m_max[options.day]
  let precip_hours_unit = data.daily_units.precipitation_hours
  let precip_sum_unit = data.daily_units.precipitation_sum
  let wind_gusts_unit = data.daily_units.windgusts_10m_max
  let wind_dir_unit = data.daily_units.winddirection_10m_dominant
  let wind_speed_unit = data.daily_units.windspeed_10m_max
  let temp_low_unit = data.daily_units.temperature_2m_min
  let temp_high_unit = data.daily_units.temperature_2m_max
  let weathercode_unit = data.daily_units.weathercode
  var date = ""
  
  if (options.day == 0) {
    date = "today."
  } else if (options.day > 1) {
    date = "in " + options.day + " days."
  } else {
    date = "tomorrow."
  }
  if (precip > 0) {
    console.log(`You might need your galoshes ${date}`)
  } else {
    console.log(`You will not need your galoshes ${date}`)
  }

  if (VERBOSE) {
    console.log(`\nForecast for ${time}:\n`)
    console.log(`\tHigh: ${temp_high} ${temp_high_unit}\tLow: ${temp_low} ${temp_low_unit}`)
    console.log(`\tPrecipitation: ${precip_sum} ${precip_sum_unit} over ${precip} ${precip_hours_unit}`)
    console.log(`\tWind: ${wind_speed} ${wind_speed_unit} from ${wind_dir} ${wind_dir_unit} with gusts up to ${wind_gusts} ${wind_gusts_unit}`)
    console.log(`\tWMO weather code: ${weathercode}`)
    console.log(`\tSunrise: ${sunrise}`)
    console.log(`\tSunset: ${sunset}\n`)
    console.log(`Current weather (${current_time}):\n`)
    console.log(`\tTemperature: ${current_temp} ${temp_high_unit}`)
    console.log(`\tWind: ${current_wind_speed} ${wind_speed_unit} from ${current_wind_dir} ${wind_dir_unit}`)
    console.log(`\tWMO weather code: ${current_weathercode}\n`)
    process.exit(0)
  }

}

main()

function show_help() {
  console.log("\nUsage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE")
  console.log("  -h\t\tShow this help message and exit.")
  console.log("  -n, -s\tLatitude: N positive; S negative.")
  console.log("  -e, -w\tLongitude: E positive; W negative.")
  console.log("  -z\t\tTime zone: uses /etc/timezone by default.")
  console.log("  -d 0-6\tDay to retrieve weather: 0 is today; defaults to 1.")
  console.log("  -v\t\tVerbose output: returns full weather forecast.")
  console.log("  -j\t\tEcho pretty JSON from open-meteo API and exit.\n")
  process.exit(0)
}