# us-visa-scheduler

### What it does
It doesn't schedule, but it notifies (plays a song) you when a good candidate date is available.

#### Tutorial
1. Keep the tab open all the time.
1. Make sure there's still an available audio [here](https://cdn.freesound.org/previews/533/533869_5828667-lq.mp3). If it's not the case, find one and replace the value of the variable `audioSource`.
1. Go to the **us-visa** web page and hit `Reschedule appointment`.
1. With your browser `Network` tab open (Hit F12), select the city you want to schedule an appointment and get the `cityCode`, `language` and the `sessionNumber` values. You can find them in `Headers -> General -> Request URL`. For example, in this **url** `https://ais.usvisa-info.com/en-ca/niv/schedule/41884788/appointment/days/95.json?appointments[expedite]=false`, the `cityCode` would be **95**, the `language` **en-ca**, and the `sessionNumber` **41884788**.
1. Replace the value of the variable `cityCode` with the new value.
1. Replace the value of the variable `language` with the new value.
1. Replace the value of the variable `sessionNumber` with the new value.
1. Replace the value of the variable `formattedMaxDate` with the value you wish.
1. Copy and paste the content of `us-visa-scheduler.js` gist file below in the browser `Console` (Hit F12) tab.
1. Wait for the audio to play. When it does, run for it (**I mean it!**) and try to schedule the date (select a different city and then selected the desired city again from the drop list to refresh the calendar).
1. Repeat the process until you find a good date.

#### Tips
1. Based on nothing, but pure empiricism, it seems that Fridays around 17:15 UTC are a good day to find new available dates. Just saying.
