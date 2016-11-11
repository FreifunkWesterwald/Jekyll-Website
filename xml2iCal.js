'use strict';

// jshint node: true
// jshint esversion: 6

const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;

const leftpad = (s, n, f = '0') =>
s.length >= n ? s : (f.repeat(n) + s).slice(-n);

function getValue(fromEL, name) {
    const els = fromEL.getElementsByTagName(name);
    if (els.length > 1) {
        console.log(`Warning: the tag with the '${name}' exists twice`);
    } else if (els.length < 1) {
        return;
    }

    return els[0].textContent;
}

function toDateTimeStamp(date) {
    const fullYear = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const dayInMonth = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    return leftpad(fullYear, 4) +
    leftpad(month, 2) +
    leftpad(dayInMonth, 2) +
    'T' +
    leftpad(hours, 2) +
    leftpad(minutes, 2) +
    leftpad(seconds, 2) +
    'Z';
}


const inFileName = 'termine.xml';
const outFileName = 'termine.ics';
const orgName = 'Freifunk Westerwald';
const domain = 'freifunk-westerwald.de';
const urlPrefix = 'https://freifunk-westerwald.de/termine/';
const email = 'general@freifunk-westerwald.de';

const nl = '\r\n';

module.exports = function() {
    const rawXml = fs.readFileSync(inFileName, {encoding: 'utf-8'});
    const events = new DOMParser().parseFromString(rawXml);

    const monthlyEls = events.getElementsByTagName('monthly');
    if (monthlyEls.length != 1) {
        console.error(`Error: more or less than one 'monthly' element`);
        process.exit(1);
    }

    const monthly = monthlyEls[0];
    let iCal = '';
    iCal += `BEGIN:VCALENDAR${nl}`;
    iCal += `VERSION:2.0${nl}`;
    iCal += `PRODID:Custom//DE${nl}`;
    iCal += `METHOD:PUBLISH${nl}`;

    Array.from(monthly.getElementsByTagName('event')).forEach(event => {
        const id = getValue(event, 'id');
        const location = getValue(event, 'location');
        const summary = getValue(event, 'name');
        const url = getValue(event, 'url');
        const description = (getValue(event, 'description') || '') +
        `Mehr Infos auf ${url.startsWith('http') ? url : urlPrefix + url}`;

        const startdate = getValue(event, 'startdate');
        const starttime = getValue(event, 'starttime');
        const enddate = getValue(event, 'enddate');
        const endtime = getValue(event, 'endtime');

        iCal += `BEGIN:VEVENT${nl}`;
        
        iCal += `UID:${id}@${domain}${nl}`;

        if (orgName && email) {
            iCal += `ORGANIZER:MAILTO:${email}${nl}`;
        }
        if (location) {
            iCal += `LOCATION:${location}${nl}`;
        }
        if (summary) {
            iCal += `SUMMARY:${summary}${nl}`;
        }
        if (description) {
            iCal += `DESCRIPTION:${description}${nl}`;
        }

        iCal += `CLASS:PUBLIC${nl}`;

        iCal += `DTSTAMP:${toDateTimeStamp(new Date())}${nl}`;

        if (startdate) {
            iCal += `DTSTART:${toDateTimeStamp(new Date(`${startdate} ${starttime}`))}${nl}`;
        }
        if (enddate) {
            iCal += `DTEND:${toDateTimeStamp(new Date(`${enddate} ${endtime}`))}${nl}`;
        }

        iCal += `END:VEVENT${nl}`;
    });

    iCal += `END:VCALENDAR${nl}`;

    console.log(iCal);

    fs.writeFileSync(outFileName, iCal, {encoding: 'utf-8'})
};
