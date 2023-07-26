const audioSource = 'https://cdn.freesound.org/previews/533/533869_5828667-lq.mp3'
const cityCode = 56; // São Paulo
const formattedMaxDate = '2023-11-30'; // YYYY-MM-DD
const maxNumberOfCandidateDates = 4; //avoid throttling
const language = 'pt-br';
const sessionNumber = 38681568;

const minIntervalBetweenFetchesInMinutes = 2;
const randomizedIntervalBetweenFetchesInMinutes = 2;
const secondsBetweenDateTimeFetchCalls = 10;
const audio = new Audio(audioSource)
const maxDate = new Date(formattedMaxDate).getTime();

function getDatesUrl() {
    return `https://ais.usvisa-info.com/${language}/niv/schedule/${sessionNumber}/appointment/days/${cityCode}.json?appointments[expedite]=false`
}


function getDateTimesUrl(availableDay) {
    return `https://ais.usvisa-info.com/${language}/niv/schedule/${sessionNumber}/appointment/times/${cityCode}.json?date=${availableDay}&appointments[expedite]=false`
}

let forceStop = false

async function start() {
    console.log('Algorithm is running')
    forceStop = false
    let attempt = 0;
    while (!forceStop) {
        console.log('Max allowed date: ' + new Date(maxDate).toString());
        console.log('Num of attempts: ' + ++attempt)
        try {
            await search()
        } catch (err) {
            console.error(err)
        }

        const waitTime = (minIntervalBetweenFetchesInMinutes + Math.random() * randomizedIntervalBetweenFetchesInMinutes);
        console.log('Waiting time: ' + Math.trunc(waitTime) + 'm')
        await sleep(waitTime * 1000 * 60)
        console.log('-----------------------------')
    }
}

function stop() {
    forceStop = true
}

async function fetchAvailableDates() {
    console.log('Fetching dates...');
    const request = new Request(getDatesUrl(), {
        method: 'GET', headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5,zh-CN;q=0.4,zh;q=0.3',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const res = await fetch(request);
    const json = await res.json(); //[{"date":"2023-11-27","business_day":true},{"date":"2023-11-28","business_day":true}]
    return json
        .filter(item => item.business_day);
}

async function fetchAvailableDateTimes(date) {
    console.log('Fetching available time slots...');
    const request = new Request(getDateTimesUrl(date.toString()), {
        method: 'GET', headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5,zh-CN;q=0.4,zh;q=0.3',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const res = await fetch(request);
    const json = await res.json(); //{available_times: ["08:15"], business_times: ["08:15", "08:30", "09:15"]}
    return json.available_times
        .reduce((acc, item) => json.business_times.includes(item) ? [...acc, item] : acc, []);
}

async function search() {
    const availableDates = await fetchAvailableDates();
    const availableDatesBeforeScheduledDate = availableDates
        .filter(item => new Date(item.date).getTime() < maxDate)
    console.log(`Found ${availableDates.length} available dates. ${availableDatesBeforeScheduledDate.length} of them are before scheduled date`);
    if (availableDatesBeforeScheduledDate.length > 0) {
        console.log(`The first one being on '${availableDatesBeforeScheduledDate[0].date}'. Filtering first ${maxNumberOfCandidateDates} of them to avoid throttling`);
        availableDates
            .filter((item, index) => index < maxNumberOfCandidateDates)
            .forEach(async (item, index) => {
                await sleep(secondsBetweenDateTimeFetchCalls * 1000 * index)
                checkCandidateDate(item);
            });
    } else {
        console.log('No candidate date was found');
    }
}

async function checkCandidateDate(bestDateOfFetch) {
    console.log('Candidate day: ' + bestDateOfFetch.date);
    console.log('Fetched day is a good candidate. Checking times.');
    const availableDateTimes = await fetchAvailableDateTimes(bestDateOfFetch.date)
    if (availableDateTimes.length > 0) {
        console.log('==================XXXX==================');
        console.log('Schedule it on: ' + bestDateOfFetch.date);
        console.log('Available times: ' + availableDateTimes.toString());
        console.log('==================XXXX==================');
        await audio.play();
    } else {
        console.log('Available day has no available time');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

await start();