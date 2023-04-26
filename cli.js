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
for (var i=2; i<process.argv.length; i+=2) {
const option = process.argv[i]
const value = process.argv[i+1]
options.timezone = timezone
options.day = 1
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
    options.timezone = Number(value)
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

let response;
let data;
let precip;
let current_time;
let current_temp;
let current_wind_speed;
let current_wind_dir;
let weathercode;
let time;
let sunset;
let sunrise;
let precip_sum;
let wind_gusts;
let wind_dir;
let wind_speed;
let temp_low;
let temp_high;
let current_weathercode;
let precip_hours_unit;
let wind_gusts_unit;
let wind_dir_unit;
let wind_speed_unit;
let temp_low_unit;
let temp_high_unit;
let weathercode_unit;

async function main() {
  response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${options.latitude}&longitude=${options.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=${options.timezone}`)
  data = await response.json()
  console.log(data)
  precip = data.daily.precipitation_hours[options.day]
  current_time = data.current_weather.time
  current_temp = data.current_weather.temperature
  current_wind_speed = data.current_weather.windspeed
  current_wind_dir = data.current_weather.winddirection
  weathercode = data.current_weather.weathercode
  time = data.daily.time[options.day]
  sunset = data.daily.sunset[options.day]
  sunrise = data.daily.sunrise[options.day]
  precip_sum = data.daily.precipitation_sum[options.day]
  wind_gusts = data.daily.windgusts_10m_max[options.day]
  wind_dir = data.daily.winddirection_10m_dominant[options.day]
  wind_speed = data.daily.windspeed_10m_max[options.day]
  temp_low = data.daily.temperature_2m_min[options.day]
  current_weathercode = data.daily.weathercode[options.day]
  temp_high = data.daily.temperature_2m_max[options.day]
  precip_hours_unit = data.daily_units.precipitation_hours
  precip_sum_unit = data.daily_units.precipitation_sum
  wind_gusts_unit = data.daily_units.windgusts_10m_max
  wind_dir_unit = data.daily_units.winddirection_10m_dominant
  wind_speed_unit = data.daily_units.windspeed_10m_max
  temp_low_unit = data.daily_units.temperature_2m_min
  temp_high_unit = data.daily_units.temperature_2m_max
  weathercode_unit = data.daily_units.weathercode
  var date = ""

  if (JSON_ONLY) {
    console.log(data)
    process.exit(0)
  }
    
  if (VERBOSE) {
  console.log()
  process.exit(0)
  }

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
}

main()

function show_help() {
  console.log("\nUsage: $0 [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE")
  console.log("  -h\t\tShow this help message and exit.")
  console.log("  -n, -s\tLatitude: N positive; S negative.")
  console.log("  -e, -w\tLongitude: E positive; W negative.")
  console.log("  -z\t\tTime zone: uses /etc/timezone by default.")
  console.log("  -d 0-6\tDay to retrieve weather: 0 is today; defaults to 1.")
  console.log("  -v\t\tVerbose output: returns full weather forecast.")
  console.log("  -j\t\tEcho pretty JSON from open-meteo API and exit.\n")
  process.exit(0)
}

// printf -- "\n";
// printf -- "Forecast for ${TIME}:\n";
// printf -- "\n";
// printf -- "\tHigh: ${TEMP_HIGH}${TEMP_HIGH_UNIT}\tLow: ${TEMP_LOW}${TEMP_LOW_UNIT}\n";
// printf -- "\tPrecipitation: ${PRECIP_SUM} ${PRECIP_SUM_UNIT} over ${PRECIP_HOURS} ${PRECIP_HOURS_UNIT}\n";
// printf -- "\tWind: ${WIND_SPEED} ${WIND_SPEED_UNIT} from ${WIND_DIRECTION}${WIND_DIRECTION_UNIT} with gusts up to ${WIND_GUSTS} ${WIND_GUSTS_UNIT} \n";
// printf -- "\tWMO weather code: ${WEATHERCODE}\n";
// printf -- "\tSunrise: ${SUNRISE}\n";
// printf -- "\tSunset: ${SUNSET}\n";
// printf -- "\n";
// printf -- "Current weather (${CURRENT_TIME}):\n";
// printf -- "\n";
// printf -- "\tTemperature: ${CURRENT_TEMP}${TEMP_HIGH_UNIT}\n";
// printf -- "\tWind: ${CURRENT_WIND_SPEED} ${WIND_SPEED_UNIT} from ${CURRENT_WIND_DIRECTION}${WIND_DIRECTION_UNIT}\n";
// printf -- "\tWMO weather code: ${CURRENT_WEATHERCODE}\n";
// exit 0