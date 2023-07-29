const cityCodes = [55, 56]; // Rio, São Paulo
const maxFormattedDate = '2023-02-28'; // YYYY-MM-DD
const minFormattedDate = '2023-02-01'; // YYYY-MM-DD
const audioSource = 'https://cdn.freesound.org/previews/533/533869_5828667-lq.mp3'
const language = 'pt-br';
const sessionNumber = 38681568;

//===================================

const maxNumberOfCandidateDates = 4; //avoid throttling
const minIntervalBetweenFetchesInMinutes = 2;
const maxIntervalBetweenFetchesInMinutes = 4;
const intervalBetweenDateTimeFetchCallsInSeconds = 10;
const audio = new Audio(audioSource)
const maxDate = new Date(maxFormattedDate).getTime();
const minDate = new Date(minFormattedDate).getTime();

let forceStop = false

function stop() {
    forceStop = true
}

async function start() {
    console.log('Algorithm is running')
    forceStop = false
    let attempt = 0;
    while (!forceStop) {
        console.log('Max allowed date: ' + new Date(maxDate).toString());
        console.log('Min allowed date: ' + new Date(minDate).toString());
        console.log('Num of attempts: ' + ++attempt)
        try {
            await search(cityCodes)
        } catch (err) {
            console.error(err)
        }

        console.log('-----------------------------')
    }
}


async function search(cities) {
    for (let cityCode of cities) {
        const cityAvailableDates = await fetchAvailableDates(cityCode);
        const cityAvailableDatesInTimeRange = cityAvailableDates
            .filter(item => {
                const date = new Date(item.date).getTime();
                return date > minDate && date < maxDate;
            })
        console.log(`Found ${cityAvailableDates.length} available dates. ${cityAvailableDatesInTimeRange.length} of them are in the time range`);
        if (cityAvailableDatesInTimeRange.length > 0) {
            await checkCityAvailableDates(cityAvailableDatesInTimeRange, cityCode);
        } else {
            console.log('No candidate date was found for city ' + cityCode);
        }
    }
    const maxMinDiff = maxIntervalBetweenFetchesInMinutes - minIntervalBetweenFetchesInMinutes;
    const waitTime = (minIntervalBetweenFetchesInMinutes + Math.random() * maxMinDiff);
    console.log('Waiting time: ' + Math.trunc(waitTime) + 'm')
    await sleep(waitTime * 1000 * 60)
}

async function checkCityAvailableDates(cityAvailableDatesInTimeRange, cityCode) {
    console.log(`The first one being on '${cityAvailableDatesInTimeRange[0].date}'. Filtering up to ${maxNumberOfCandidateDates} to avoid throttling`);
    await Promise.all(cityAvailableDatesInTimeRange
        .filter((_, index) => index < maxNumberOfCandidateDates)
        .map(async (date, index) => {
            await sleep(intervalBetweenDateTimeFetchCallsInSeconds * 1000 * index);
            await checkDateTimes(cityCode, date);
        }));
}

async function checkDateTimes(cityCode, day) {
    console.log(`City ${cityCode}. Candidate day ${day.date}`);
    console.log('Checking times of the day');
    const availableDateTimes = await fetchAvailableDateTimes(cityCode, day.date)
    if (availableDateTimes.length > 0) {
        console.log('==================XXXX==================');
        console.log('City code: ' + cityCode);
        console.log('Schedule it on: ' + day.date);
        console.log('Available times: ' + availableDateTimes.toString());
        console.log('==================XXXX==================');
        await audio.play();
        return true;
    } else {
        console.log('Available day has no available time');
    }
    return false;
}

async function fetchAvailableDates(cityCode) {
    console.log('Fetching dates...');
    const url = getDatesUrl(cityCode);
    const request = createRequest(url);
    const res = await fetch(request);
    const json = await res.json(); //[{"date":"2023-11-27","business_day":true},{"date":"2023-11-28","business_day":true}]
    return json
        .filter(item => item.business_day);
}

async function fetchAvailableDateTimes(cityCode, date) {
    console.log('Fetching available time slots...');
    const request = createRequest(getDayTimesUrl(cityCode, date.toString()));
    const res = await fetch(request);
    const json = await res.json(); //{available_times: ["08:15"], business_times: ["08:15", "08:30", "09:15"]}
    return json.available_times
        .reduce((acc, item) => json.business_times.includes(item) ? [...acc, item] : acc, []);
}

function createRequest(url) {
    return new Request(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5,zh-CN;q=0.4,zh;q=0.3',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
}

function getDatesUrl(cityCode) {
    return `https://ais.usvisa-info.com/${language}/niv/schedule/${sessionNumber}/appointment/days/${cityCode}.json?appointments[expedite]=false`
}


function getDayTimesUrl(cityCode, availableDay) {
    return `https://ais.usvisa-info.com/${language}/niv/schedule/${sessionNumber}/appointment/times/${cityCode}.json?date=${availableDay}&appointments[expedite]=false`
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (typeof window !== "undefined") {
    void start();
} else {
    module.exports = {
        language,
        sessionNumber,
        minIntervalBetweenFetchesInMinutes,
        intervalBetweenDateTimeFetchCallsInSeconds,
        maxNumberOfCandidateDates,
        sleep,
        createRequest,
        getDayTimesUrl,
        getDatesUrl,
        fetchAvailableDateTimes,
        fetchAvailableDates,
        checkDateTimes,
        checkCityAvailableDates,
        search
    }
}

