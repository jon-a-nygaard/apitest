'use strict';
const request = require('request');
const fs = require('fs');
const oldAPI = require('./old.json');

const downloadNew = () => {
	request('http://api.highcharts.com/highcharts/option/dump.json', function(err, response, body) {
		const status = response.statusCode;
		if (status === 200) {
			const newAPI = body;
			fs.writeFileSync('new.json', body);
		} else {
			console.log('Could not download new API, status: ' + status);
		}
	})
}

const whichValuesAreDifferent = (n, o) => {
	let newKeys = Object.keys(n);
	let oldKeys = Object.keys(o);
	// First check for differences between new and old
	newKeys.forEach((key) => {
		if (oldKeys.indexOf(key) > -1) {
			if (o[key] !== n[key]) {
				console.log('The ' + key + ' has different values.')
			}
		} else {
			console.log('The ' + key + ' did not exist in the old api.')
		}
	})
	// Check if some keys are deleted in new
	oldKeys.forEach((key) => {
		if (typeof n[key] === 'undefined') {
			console.log('The ' + key + ' has been deleted in the new api.')
		}
	})
}

if (!fs.existsSync('new.json')) {
	console.log('new.json does not exist, downloading from Highcharts API');
	console.log('run script again after download');
	downloadNew();
} else {
	const newAPI = require('./new.json');
	let newMapIndex = {};
	newAPI.forEach((obj, i) => {
		newMapIndex[obj.name] = i;
	})
	let oldMapIndex = {};
	oldAPI.forEach((obj, i) => {
		oldMapIndex[obj.name] = i;
	})
	newAPI.forEach((obj, i) => {
		let newString = JSON.stringify(obj);
		if (typeof oldMapIndex[obj.name] !== 'undefined') {
			let oldObject = oldAPI[oldMapIndex[obj.name]];
			let oldString = JSON.stringify(oldObject);
			if (newString !== oldString) {
				console.log('There is a difference in ' + obj.name + ' between the old and the new api');
				console.log('From new.json: ');
				console.log(obj);
				console.log('From old.json');
				console.log(oldObject);
				whichValuesAreDifferent(obj, oldObject);
				console.log('')
			}
		} else {
			console.log(obj.name + ' does not exist in old API');
			console.log('')
		}
	})
}