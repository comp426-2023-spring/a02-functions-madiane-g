#!/usr/bin/env node
const moment = require('moment-timezone')

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

async function main() {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${options.latitude}&longitude=${options.longitude}&daily=precipitation_hours&timezone=${options.timezone}`)
  const data = await response.json()
  const precip = data.daily.precipitation_hours[options.day]
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
}

main()