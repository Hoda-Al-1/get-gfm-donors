
    const linkinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" class="mercado-match" focusable="false">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
    </svg>`;

    var newWindow;
var global_donors = [];
var rates = [];
var singleDonors = [];
    var index = 0;
    var checkEmail = false;
    var minConnections = 1;
    var allow_ghost_image = 1;
var minAmount = 50;
var maxAmount = 0;
var is_search_linkedin = true;
var is_search_insta = true;
var is_search_bluesky = true;
var delayMs = 3000;
var newSearchStartDate;

document.addEventListener('DOMContentLoaded', async function () {
    console.info('DOM is fully loaded and parsed!');

    if (document.querySelector('#txtMinAmount')) {
        minAmount = parseInt(txtMinAmount.value);
        txtMinAmount.addEventListener('input', function () {
            minAmount = parseInt(this.value);
        });
    }
    if (document.querySelector('#txtMaxAmount')) {
        maxAmount = parseInt(txtMaxAmount.value);
        txtMaxAmount.addEventListener('input', function () {
            maxAmount = parseInt(this.value);
        });
    }

    if (document.querySelector('#chkSearchInsta')) {
        is_search_insta = chkSearchInsta.checked;
        chkSearchInsta.addEventListener('change', function () {
            is_search_insta = chkSearchInsta.checked;
        });
    }

    if (document.querySelector('#chkSearchBlusky')) {
        is_search_bluesky = chkSearchBlusky.checked;
        chkSearchBlusky.addEventListener('change', function () {
            is_search_bluesky = chkSearchBlusky.checked;
        });
    }

    if (document.querySelector('#chkSearchLinkedIn')) {
        is_search_linkedin = chkSearchLinkedIn.checked;
        chkSearchLinkedIn.addEventListener('change', function () {
            is_search_linkedin = chkSearchLinkedIn.checked;
        });
    }

    if (document.querySelector('#chkStartFromLastSearchDate')) {
        is_startFromLastSearchDate = chkStartFromLastSearchDate.checked;
        chkStartFromLastSearchDate.addEventListener('change', async function () {
            is_startFromLastSearchDate = chkStartFromLastSearchDate.checked;
            if (is_startFromLastSearchDate) {
                var days = await getDaysFromLastSearch();
                loadDayPartsToUI(days);
            }
            document.querySelectorAll('.timespan_data').forEach(x => x.disabled = is_startFromLastSearchDate);
        });
        chkStartFromLastSearchDate.dispatchEvent(new Event('change'));
    }

    if (document.querySelector('#txtDelaySeconds')) {
        delayMs = parseFloat(txtDelaySeconds.value) * 1000;
        txtDelaySeconds.addEventListener('input', function () {
            delayMs = parseFloat(txtDelaySeconds.value) * 1000;
        });
    }
});


    // In the parent window
window.addEventListener('message', messageEventHandler);


async function messageEventHandler(event) {
    //debugger
    console.info('Message from content.js');
    //if (event.origin !== 'http://your-origin.com') return; // Security check
    var data = event.data.data;
    if (event.data.type === 'responseData') {

        var get_more_data = false;

        console.info(data);
        var existingDonor;
        global_donors[index].cnt = data.cnt;
        global_donors[index].failureReason = data.failureReason;
        global_donors[index].url = data.url;
        global_donors[index].is_ghost_image = data.is_ghost_image;

        if (data.cnt == 1) {
            const donor = global_donors[index];
            existingDonor = singleDonors.find(d => d.name === donor.name);
            if (!existingDonor) {
                singleDonors.push({
                    global_index: index,
                    name: donor.name,
                    url: data.url,
                    insta_url: undefined,
                    amountUSD: donor.amountUSD,
                    last_donation_date: donor.last_donation_date,
                    last_donation_time_ago: timeAgo(donor.last_donation_date),
                    donation_times: donor.donation_times,
                    email: '',
                    connections: 0,
                    address: '',
                    is_ghost_image: data.is_ghost_image,
                    donation_details: donor.donation_details
                });
            } else if (existingDonor.global_index == index) {
                //existingDonor.global_index = index;
                //existingDonor.name = donor.name;
                existingDonor.url = data.url;
                //existingDonor.amountUSD = donor.amountUSD;
                //existingDonor.last_donation_date = donor.last_donation_date;
                //existingDonor.last_donation_time_ago = timeAgo(donor.last_donation_date);
                //existingDonor.email = '';
                //existingDonor.connections = 0;
                //existingDonor.address = '';
                existingDonor.is_ghost_image = data.is_ghost_image;
            }
            if (checkEmail) {
                newWindow.location = data.url + '/overlay/contact-info/';
                get_more_data = true;
            }
            else if (minConnections > 0) {
                newWindow.location = data.url + '?action=chk_conn';
                get_more_data = true;
            }
            else {
                storeSingleDonors(singleDonors);
                //downloadHTMLFile();
            }
            updateStatusBar();
        }

        console.info('(data.cnt,existingDonor,checkEmail,minConnections)');
        console.info(data.cnt, existingDonor, checkEmail, minConnections);

        if (!get_more_data) {
            index++;
            await doSearch();
        }

    } else if (event.data.type === 'emailCheckData') {
        var _email = event.data.data.email || '';
        singleDonors[singleDonors.length - 1].email = _email;
        //downloadHTMLFile();
        storeSingleDonors(singleDonors);
        index++;
        await doSearch();
    }
    else if (event.data.type === 'connectionsCheckData') {
        var _connections = event.data.data.connections || 0;
        var _address = event.data.data.address || '';
        console.info('connectionsCheckData | index: ' + index + ' , _connections:' + _connections + ' , _address:' + _address);
        lastSingleIndex = singleDonors.length - 1;

        singleDonors[lastSingleIndex].connections = _connections;
        singleDonors[lastSingleIndex].address = _address;

        global_donors[index].connections = _connections;
        global_donors[index].address = _address;

        //downloadHTMLFile();
        storeSingleDonors(singleDonors);
        index++;
        await doSearch();
    }
}

    function storeSingleDonors(singleDonors) {
        console.info('----start storeSingleDonors----------------------- index = ' + index);

        chrome.storage.local.set({ singleDonors: singleDonors }, () => {
            console.info('chrome.storage.local set singleDonors');
        });
   // newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');
    //console.info("newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');");
    //console.info(JSON.stringify(singleDonors));
    console.info('----end storeSingleDonors----------------------- index = ' + index);
}

function storeSearchData(searchData , callback) {
    storeData('searchData', searchData, callback);
}

function storeRates(rates, callback) {
    storeData('rates', rates, callback);
}

function storeLastSearchDate(data) {
    storeData('lastSearchDate', data);
}

function storeData(key, data, callback) {
    console.info('----start store ' + key + ' ----------------------- index = ' + index);

    var obj = new Object();
    obj[key] = JSON.parse(JSON.stringify(data));

    chrome.storage.local.set(obj, () => {
        console.info('chrome.storage.local set ' + key);
        if (callback) {
            callback();
        }
    });
}

function removeFromLocalStorage(key, callback) {
    chrome.storage.local.remove(key, function () {
        if (chrome.runtime.lastError) {
            console.error('Error removing item: ', chrome.runtime.lastError);
            if (callback) callback(false);
        } else {
            console.log('Item removed successfully');
            if (callback) callback(true);
        }
    });
}

async function startSearch() {
    downloadJSON(global_donors, 'global_donors.json');
    index = 0;
    singleDonors = [];
    resultMsg.innerHTML = '';
    searchProgressMsg.innerHTML = '';
    await doSearch();
}

async function doSearch() {
    var donorsLength = global_donors.length;


    for (index; index < donorsLength; index++) {

        updateStatusBar();
        saveSearchData();

        var donor = global_donors[index];

        var donorFromInsta, donorFromBluesky, donorFromLinkedIn;

        await delay(delayMs);

        var tasks = [];
        if (is_search_insta) {
            donorFromInsta = await checkDonorInInsta(donor, index);
        }

        if (is_search_bluesky) {
            donorFromBluesky = await checkDonorInBluesky(donor, index);
        }

        if (is_search_linkedin) {
            donorFromLinkedIn = await checkDonorInLinkedIn(donor, index);
        }

        var hasResult = donorFromInsta || donorFromBluesky || donorFromLinkedIn;

        var resultDonor;
        if (hasResult) {
            const existing = singleDonors.find(d => d.name === donor.name);
            if (!existing) {
                resultDonor = {
                    global_index: index,
                    name: donor.name,
                    amountUSD: donor.amountUSD,
                    last_donation_date: donor.last_donation_date,
                    last_donation_time_ago: timeAgo(donor.last_donation_date),
                    donation_times: donor.donation_times,
                    donation_details: donor.donation_details
                };
                singleDonors.push(resultDonor);
            } else {
                resultDonor = existing;
            }

            Object.assign(resultDonor, donorFromBluesky || {});
            Object.assign(resultDonor, donorFromInsta || {});
            Object.assign(resultDonor, donorFromLinkedIn || {});
        }
    }


    console.info('all donors looped !');
    if (singleDonors.length > 0) {
        // Call the function to download the HTML file
        await downloadHTMLFileWithMinConnections();//downloadHTMLFile();
    }
}


const xSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-lrsllp r-1nao33i r-16y2uox r-8kz0gk"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>`;


async function checkDonorInLinkedIn(donor, index) {
    logAndArea(`searching linkedin for (${donor.name}), donor index = ${index} ...`);

    let resultDonor = null;
    const linkedin_user_result = await get_linkedin_user(donor.name);

    if (linkedin_user_result.ajax_success === true) {
        const linkedin_user = linkedin_user_result.user;

        if (linkedin_user) {
            const _is_ghost_image = !linkedin_user.linkedin_image_url;
            const user_details = await get_linkedin_profile_details(getLastUrlSegment(linkedin_user.url));

            resultDonor = {
                global_index: index,
                name: donor.name,
                url: linkedin_user.url,
                connections: 0,
                address: linkedin_user.secondarySubtitle,
                is_ghost_image: _is_ghost_image,
                linkedin_image_url: linkedin_user.linkedin_image_url
            };

            if (user_details) {
                resultDonor.connections = user_details.connections;
                resultDonor.address += ' [' + user_details.countryCode?.toLocaleUpperCase() + ']';
            }

            global_donors[index].url = linkedin_user.url;
            global_donors[index].connections = resultDonor.connections;
            global_donors[index].address = resultDonor.address;

            if (resultDonor.connections < minConnections) {
                resultDonor = null; // too few connections, treat as no valid donor
            }
        } else {
            global_donors[index].failureReason = 'more_than_one';
        }
    } else {
        global_donors[index].failureReason = 'ajax_error';
    }

    return resultDonor;
}


async function checkDonorInInsta(donor, index) {
    logAndArea(`searching instagram for (${donor.name}), donor index = ${index} ...`);

    let resultDonor = null;
    const insta_user = await get_instagram_user(donor.name);

    if (insta_user) {
        const _insta_url = 'https://www.instagram.com/' + insta_user.username;
        const _profile_pic_url = insta_user.profile_pic_url;
        const _search_social_context = insta_user.search_social_context;

        resultDonor = {
            global_index: index,
            name: donor.name,
            insta_url: _insta_url,
            insta_image_url: _profile_pic_url,
            insta_followers_count: _search_social_context
        };

        global_donors[index].insta_url = _insta_url;
        logAndArea(`donor found in instagram for (${donor.name}), donor index = ${index}`);
    }

    return resultDonor;
}


async function checkDonorInBluesky(donor, index) {
    logAndArea(`searching bluesky for (${donor.name}), donor index = ${index} ...`);

    let resultDonor = null;
    const bluesky_user = await get_bluesky_user(donor.name);

    if (bluesky_user) {
        const _bluesky_url = 'https://bsky.app/profile/' + bluesky_user.handle;
        const _bluesky_image_url = bluesky_user.avatar;

        resultDonor = {
            global_index: index,
            name: donor.name,
            bluesky_url: _bluesky_url,
            bluesky_image_url: _bluesky_image_url
        };

        global_donors[index].bluesky_url = _bluesky_url;
        logAndArea(`donor found in bluesky for (${donor.name}), donor index = ${index}`);
    }

    return resultDonor;
}


    // Full Page Loader Control Functions
    function showLoader() {
        document.getElementById('loader').style.display = 'flex';
        }

    function hideLoader() {
        document.getElementById('loader').style.display = 'none';
        }

    function timeAgo(date) {
            const now = new Date();
    const diffMs = now - date; // Difference in milliseconds

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

            if (years > 0) {
                return `${years} year${years > 1 ? 's' : ''} ago`;
            } else if (months > 0) {
                return `${months} month${months > 1 ? 's' : ''} ago`;
            } else if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ago`;
            } else if (hours > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (minutes > 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else {
                return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
            }
        }

    function getCampaignSlug(campaignSlugInput) {
        let campaignSlug;

    // Check if the input is a full URL or just the slug
    if (campaignSlugInput.includes('gofundme.com')) {
                // Extract the slug from the full URL
                const urlParts = campaignSlugInput.split('/');
    campaignSlug = urlParts[4].split('?')[0]; // Get the last part before any query parameters
            } else {
        campaignSlug = campaignSlugInput; // Treat as slug directly
            }
    return campaignSlug;
        }

async function get_donors_from_to(camp_url, fromDate, toDate) {
    return await get_donors(camp_url, 0, fromDate, toDate , true)
}

async function get_donors_since_days(camp_url, untilDays, minPerOneDonation, maxPerOneDonation) {
    return await get_donors(camp_url, untilDays, null, null ,false, minPerOneDonation, maxPerOneDonation);
}

async function get_donors(camp_url, untilDays, fromDate, toDate, include_is_anonymous, minPerOneDonation, maxPerOneDonation) {//get donorts form one campagin
    let campaignSlug = getCampaignSlug(camp_url);
	include_is_anonymous = include_is_anonymous || false;
    let donors = [];
    let offset = 0;
    const limit = 100; // Increased limit per page
    let hasNext = true; // Pagination flag

    while (hasNext) {
        try {
            const response = await fetch(`https://gateway.gofundme.com/web-gateway/v1/feed/${campaignSlug}/donations?limit=${limit}&offset=${offset}&sort=undefined`, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\""
                },
                "referrer": "https://www.gofundme.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "omit"
            });

            var data = await response.json();

            var orgDonors = data.references.donations;

            orgDonors.forEach(x => x.created_at = new Date(x.created_at));

            // Append new donations to the donors array
            var filteredByDate = include_is_anonymous ? orgDonors : orgDonors.filter(x => !x.is_anonymous);
            if (untilDays > 0) {
                filteredByDate = filteredByDate.filter(x => isWithinLastXDays(x.created_at, 0, untilDays));
            } else {
                if (fromDate) {
                    filteredByDate = filteredByDate.filter(x => x.created_at >= fromDate);
                }
                if (toDate) {
                    filteredByDate = filteredByDate.filter(x => x.created_at < toDate);
                }
            }
            var hasDateFilter = untilDays > 0 || fromDate || toDate;

            var newDonors = filteredByDate.map(x => ({
                name: include_is_anonymous && x.is_anonymous ? x.name + '_' + x.donation_id : x.name,
                amount: x.amount,
                currencycode: x.currencycode,
                amountUSD: convertToUSD(x.amount, x.currencycode),
                created_at: x.created_at,
                camp_url: campaignSlug
            }));

            if(minPerOneDonation > 0){
                newDonors = newDonors.filter(x => x.amountUSD >= minPerOneDonation)
            }

            if(maxPerOneDonation > 0){
                newDonors = newDonors.filter(x=> x.amountUSD <= maxPerOneDonation)
            }

            donors = donors.concat(newDonors);

            // Check if there are more pages
            hasNext = data.meta.has_next;

            if (hasDateFilter && filteredByDate.length == 0) {
                hasNext = false;
            }

            // Increment offset for the next page
            offset += limit;

        } catch (error) {
            console.error('Error fetching donors:', error);
            hasNext = false; // Stop if there's an error
        }
    }
    return groupDonors(donors);
}

// Summing amounts for each unique donor
function groupDonors(donors) {
    return donors.reduce((acc, donor) => {
        // Check if the donor already exists in the accumulator
        const existingDonor = acc.find(d => d.name === donor.name);

        const donation_details = { amount: donor.amount, currencycode: donor.currencycode, donation_date: donor.created_at, camp_url: donor.camp_url };

        if (existingDonor) {
            // If donor exists, add the current amount to the existing total
            existingDonor.amountUSD += donor.amountUSD;
            existingDonor.donation_details.push(donation_details);
            existingDonor.donation_times++;
            existingDonor.last_donation_date = existingDonor.last_donation_date > donor.created_at ? existingDonor.last_donation_date : donor.created_at;
        } else {
            // If donor doesn't exist, add a new entry to the accumulator
            acc.push({ name: donor.name, amountUSD: donor.amountUSD, last_donation_date: donor.created_at, donation_times: 1, donation_details: [donation_details] });
        }

        return acc;
    }, []);//.sort((a, b) => b.amountUSD - a.amountUSD);
}

function sumByCurrency(arr) {
    const result = {};

    arr.forEach(item => {
        const { amount, currencycode } = item;
        if (result[currencycode]) {
            result[currencycode] += amount;
        } else {
            result[currencycode] = amount;
        }
    });

    return Object.keys(result).map(code => ({
        currencycode: code,
        amount: result[code]
    }));
}

function formatDonationsText(donationsArray) {
    return donationsArray
        .map(item => `${item.amount} ${item.currencycode}`)
        .join('<br />');
}

function sumAndFormatDonations(arr) {
    return formatDonationsText(sumByCurrency(arr));
}

async function fetchRates() {
    const response = await fetch("https://v6.exchangerate-api.com/v6/34ab08644d31c8d77ba7eae1/latest/USD");
    if (!response.ok) {
        throw new Error("Failed to fetch exchange rates.");
    }
    const data = await response.json();
    return {
        conversion_rates: data.conversion_rates,
        time_last_update_unix: data.time_last_update_unix
    };
}

function isSameCurrentDate(unixTime) {
    const currentDate = new Date();
    const dateFromUnix = new Date(unixTime * 1000); // Convert Unix timestamp to Date

    return (
        currentDate.getFullYear() === dateFromUnix.getFullYear() &&
        currentDate.getMonth() === dateFromUnix.getMonth() &&
        currentDate.getDate() === dateFromUnix.getDate()
    );
}

function convertToUSD(amount, currencyCode) {
    if (!rates.hasOwnProperty(currencyCode)) {
        return 0;//throw new Error("Invalid or unsupported currency code.");
    }

    const rateToUSD = rates["USD"] / rates[currencyCode];
    const convertedAmount = amount * rateToUSD;

    return convertedAmount;
}

function megeAndGroupDonors(donors) {
    return donors.reduce((acc, donor) => {
        // Check if the donor already exists in the accumulator
        const existingDonor = acc.find(d => d.name === donor.name);

        if (existingDonor) {
            // If donor exists, add the current amount to the existing total
            existingDonor.amountUSD += donor.amountUSD;
            existingDonor.donation_details = existingDonor.donation_details.concat(donor.donation_details);
            existingDonor.donation_times += donor.donation_times;
            existingDonor.last_donation_date = existingDonor.last_donation_date > donor.last_donation_date ? existingDonor.last_donation_date : donor.last_donation_date;
        } else {
            // If donor doesn't exist, add a new entry to the accumulator
            acc.push({ name: donor.name, amountUSD: donor.amountUSD, last_donation_date: donor.last_donation_date, donation_times: donor.donation_times, donation_details: donor.donation_details });
        }

        return acc;
    }, []).sort((a, b) => b.amountUSD - a.amountUSD);
}

    function timeStampToDate(timestamp) {// Unix timestamp in seconds

            // Convert to milliseconds by multiplying by 1000
            const date = new Date(timestamp * 1000);

    // Format the date (example: YYYY-MM-DD HH:MM:SS format)
    const formattedDate = formatToDateTime(date);

    return formattedDate;
        }

    function getTimeStamp(daysAgo) {
        daysAgo = daysAgo || 0;
    // Define the number of seconds in days
    const secondsInDays = daysAgo * 24 * 60 * 60;

    // Get current Unix timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Subtract days
    const timestampDaysAgo = currentTimestamp - secondsInDays;

    //console.log('timestampDaysAgo:' + timestampDaysAgo);

    return timestampDaysAgo;
        }

function isWithinLastXDays(givenDate, minDays, maxDays) {
    const currentDate = new Date();
    const differenceInDays = get_days_diff(givenDate, currentDate);
    return differenceInDays >= minDays && differenceInDays <= maxDays;
}

function get_days_diff(oldDate, newDate) {
    // Calculate the difference in time (milliseconds)
    const differenceInTime = newDate - oldDate;

    // Convert the time difference to days
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

    return differenceInDays;
}

function loadDayPartsToUI(daysFloat) {


    updateresultDaysText(daysFloat);

    // Extract whole days
    const days = Math.floor(daysFloat);

    // Calculate the fractional part of the day
    const fractionalDay = daysFloat - days;

    // Convert fractional day to hours
    const totalHours = fractionalDay * 24;
    const hours = Math.floor(totalHours);

    // Calculate the fractional part of the hour
    const fractionalHour = totalHours - hours;

    // Convert fractional hour to minutes
    const totalMinutes = fractionalHour * 60;
    const minutes = Math.floor(totalMinutes);

    console.info(`Days: ${days}, Hours: ${hours}, Minutes: ${minutes}`);

    txtDays.value = days;
    txtHours.value = hours;
    txtMinutes.value = minutes;
}

async function getDaysFromLastSearch() {
    var lastSearchStartDate = await getLastSearchDateFromStorage();
    if (lastSearchStartDate && document.getElementById('lblLastSearchDate')) {
        lblLastSearchDate.innerText = '( '+ formatToDateTime(lastSearchStartDate) + ' )';
    }
    return get_days_diff(lastSearchStartDate, new Date());
}

async function getRatesFromStorage() {
    var storgeData = await chrome.storage.local.get();
    var rates = storgeData.rates;
    if (!rates || !isSameCurrentDate(rates.time_last_update_unix)) {
        rates = await fetchRates();
        storeRates(rates);
    }
    return rates.conversion_rates;
}

    async function fetchDonors() {
		
    rates = await getRatesFromStorage();
	
    const campaignSlugInput = document.getElementById('campaignSlug').value;
    const donorListElement = document.getElementById('donorList');

    // Clear previous results
    donorListElement.innerHTML = '';

    const elements = document.querySelectorAll('[data-sort]');

            elements.forEach(element => {
        element.setAttribute('data-sort-dir', '');
            });
   
    if (campaignSlugInput) {
        // Show loader
        showLoader();

        global_donors = await get_donors(campaignSlugInput);

    // Hide loader
    hideLoader();

    donorsCount.innerHTML = global_donors.length;

                if (global_donors.length > 0) {
        fillListHtml();
                    btnSearchLinkedin.disabled = false;
                } else {
        donorListElement.innerHTML = '<p>No non-anonymous donors found or unable to fetch donors.</p>';
                    btnSearchLinkedin.disabled = true;
                }
            } else {
        donorListElement.innerHTML = '<p>Please enter a campaign URL slug or full URL.</p>';
        btnSearchLinkedin.disabled = true;
            }
        }


    function fillListHtml() {
            const donorListElement = document.getElementById('donorList');
    donorListElement.innerHTML = '';
            global_donors.forEach((donor, index) => {
                const donorItem = document.createElement('div');
    donorItem.classList.add('donor-item');
    donorItem.innerHTML = `
    <div>${index + 1}</div>
    <div>${donor.name}</div>
    <div>$ ${Math.round(donor.amountUSD)}</div>
    <div>${timeAgo(donor.last_donation_date)}</div>
    <div>${donor.donation_times}</div>
    <div class="btn-cont">
        <a class="linkedin-btn" href="https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(donor.name)}&origin=GLOBAL_SEARCH_HEADER&sid=AfM" target="_blank">
            ${linkinSvg}
        </a>
        <a class="x-btn" href="https://x.com/search?q=${encodeURIComponent(donor.name)}&src=typed_query&f=user" target="_blank">
            ${xSvg}
        </a>
    </div>`;
    donorListElement.appendChild(donorItem);
            });
        }

    function downloadCSV(array) {
            // Convert JSON array to CSV
            const csvRows = [];
    const headers = Object.keys(array[0]);
    csvRows.push(headers.join(',')); // Add header row

    for (const item of array) {
                const values = headers.map(header => JSON.stringify(item[header], (key, value) => value || ''));
    csvRows.push(values.join(','));
            }

    // Create a CSV string
    const csvString = csvRows.join('\n');

    // Create a blob and generate a link
    const blob = new Blob([csvString], {type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'single_donors.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function downloadLinkedHTMLFile(donors) {
    await downloadHTMLFile(donors, undefined, undefined, undefined, undefined, 2);
}

async function fetchImageAsBase64(imageUrl, width = 56, height = 56) {
    try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');

        const blob = await response.blob();

        const imageBitmap = await createImageBitmap(blob);

        // Create a canvas and draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0, width, height);

        return canvas.toDataURL(); // Base64 data URL
    } catch (error) {
        console.error('Error fetching or resizing image:', error.message);
        return ''; // Return empty string on failure
    }
}



async function renderSocialImage(url, label, alt, link, useBase64Url) {
    if (!url) return '';

    if (useBase64Url == undefined) {
        useBase64Url = true;
    }
    if (useBase64Url) {
        url = await fetchImageAsBase64(url);
        if (!url) return '';
    }
    return `
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="social-photo">
            <img src="${url}" alt="${alt}" class="profile-img" />
            <div class="social-label">${label}</div>
        </a>`;
}

var image_css = `
                                    td.img_td {
                                      text-align: center;
                                    }
                                    .empty_img {
                                      width:56px;
                                      height:56px;
                                    }
                                    .social-photo {
                                        display: inline-block;
                                        text-align: center;
                                        margin: 5px;
                                    }
                                    .profile-img {
                                        width: 56px;
                                        height: 56px;
                                        border-radius: 50%;
                                        object-fit: cover;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .social-label {
                                        font-size: 12px;
                                        margin-top: 4px;
                                    }`;

async function downloadHTMLFile(donors, sort_prop, sort_dir, partIndex, filterWithMinConnections, downloadMode) {
    /*
     downloadMode:
     1:donors have LinkedIn or Instagram //Default
     2:donors have LinkedIn
     3:donors have Instagram
     */
    donors = donors || singleDonors;
    downloadMode = downloadMode || 1;

    if (filterWithMinConnections && minConnections > 0) {
        donors = _.cloneDeep(donors.filter(x => x.connections >= minConnections || x.insta_url || x.bluesky_url));
    }

    if (downloadMode == 2) {
        donors = _.cloneDeep(donors.filter(x => x.connections >= minConnections));
    }

    sort_prop = sort_prop || 'amountUSD';
    sort_dir = sort_dir || 'desc';

    donors = donors.sort((a, b) => {
        var com_result = 0;
        if (sort_dir == 'desc') {
            com_result = b[sort_prop] - a[sort_prop];
            if (com_result == 0) {
                com_result = b['connections'] - a['connections'];
            }
        } else {
            com_result = a[sort_prop] - b[sort_prop];
            if (com_result == 0) {
                com_result = a['connections'] - b['connections'];
            }
        }
        return com_result;
    });
    // Create the HTML structure
    let ScriptOpenningTag = "<" + "script>";
    let ScriptClosingTag = "</" + "script > ";
    let htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Donors List</title>
                            <style>
                                .filter_div{
                                    margin-bottom: 10px;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }

                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                }

                                th {
                                    background-color: #f2f2f2;
                                }

                                .visited-row {
                                    background-color: #000;
                                    color: #fff;
                                }

                                    .visited-row a {
                                        color: #fff;
                                    }
                                    .pr_address{
                                        font-size:12px;
                                        margin-top: 5px;
                                        color: #3300ff;
                                    }

                                    ${image_css}
                            </style>


                        ${ScriptOpenningTag}
                            document.addEventListener("DOMContentLoaded", function () {
                                document.querySelectorAll('a').forEach((e, i) => {
                                    e.addEventListener("click", function (event) {
                                        try {
                                            // Prevents the default action (e.g., following the link)
                                            event.preventDefault();
                                            var tr = this.closest('tr');
                                            tr.classList.add('visited-row');
                                            window.open(this.href);
                                        } catch (error) {
                                            //alert(error);
                                        }
                                    });
                               });

                               document.querySelectorAll('.chk_filter').forEach((e, i) => {
                                    e.addEventListener("change", function (event) {
                                        filterDonors();
                                    });
                               });

                            });

                            function filterDonors(){
                                var hasLinedIn = chkHasLinkedIn.checked;
                                var hasInsta = chkhasInsta.checked;
                                var hasBlueSky = chkhasBlueSky.checked;
                                var i = 1;
                                document.querySelectorAll('tbody tr').forEach((x)=> {
                                    if( (hasLinedIn && !x.querySelector('a.linkedin_link')) || (hasInsta && !x.querySelector('a.instagram_link')) || (hasBlueSky && !x.querySelector('a.blueSky_link')) ){
                                        x.style.display = 'none';
                                    } else {
                                        x.style.display = 'table-row';
                                        x.querySelector('td:nth-child(1)').innerText = i++;
                                    }
                                });
                                document.querySelector('#donors_count').innerText = i - 1;
                            }
                        ${ScriptClosingTag}

                    </head>
                    <body>
                        <h2><strong>Donors List:</strong> <span id="donors_count">${donors.length}</span> donors found</h2>
                        <div class="filter_div"><label><input class="chk_filter" id="chkHasLinkedIn" type="checkbox" /> Has LinkedIn</label> (${getLinkedInSingleDonors(donors).length})</div>
                        <div class="filter_div"><label><input class="chk_filter" id="chkhasInsta" type="checkbox" /> Has Instagram</label> (${getInstagramSingleDonors(donors).length})</div>
                        <div class="filter_div"><label><input class="chk_filter" id="chkhasBlueSky" type="checkbox" /> Has BlueSky</label> (${getBlueSkySingleDonors(donors).length})</div>
                        <div class="filter_div">Found In All (${getInAllSingleDonors(donors).length})</div>
                       <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Photo</th>
                                    <th>Amount $</th>
                                    <th>Times</th>
                                    ${is_search_linkedin ? '<th>Ghost</th>' : ''}
                                    <th>Date</th>
                                    ${is_search_linkedin && checkEmail ? '<th>Email</th>' : ''}
                                    ${is_search_linkedin && minConnections > 0 ? '<th>Connections</th>' : ''}
                                    ${is_search_linkedin ? '<th>LinkedIn</th>' : ''}
                                    ${is_search_insta ? '<th>Insta</th>' : ''}
                                    ${is_search_bluesky ? '<th>Blue Sky</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                `;

    // Loop through the donors and add rows
    for (let i = 0; i < donors.length; i++) {
        const donor = donors[i];

        let images = '';
        images += await renderSocialImage(donor.linkedin_image_url, 'LinkedIn', donor.name, donor.url, false);
        images += await renderSocialImage(donor.insta_image_url, 'Instagram', donor.name, donor.insta_url);
        images += await renderSocialImage(donor.bluesky_image_url, 'Bluesky', donor.name, donor.bluesky_url);

        htmlContent += `
        <tr>
            <td>${i + 1}</td>
            <td>${donor.name}<div class="pr_address">${donor.address}</div></td>
            <td class="img_td">
                ${images ? images : `<div class="empty_img"></div>`}
            </td>
            <td>${Math.round(donor.amountUSD)}</td>
            <td>${donor.donation_times}</td>
            ${is_search_linkedin ? `<td>${(donor.is_ghost_image ? 'Yes' : (donor.is_ghost_image == undefined ? '' : 'No'))}</td>` : ''}
            <td>${formatToDateTime(donor.last_donation_date)}</td>
            ${is_search_linkedin && checkEmail ? `<td>${donor.email}</td>` : ''}
            ${is_search_linkedin && minConnections > 0 ? `<td>${donor.url ? donor.connections : ''}</td>` : ''}
            ${is_search_linkedin ? `<td>${donor.url ? `<a class="linkedin_link" href="${donor.url}" target="_blank">Open Ln</a>` : ''}</td>` : ''}
            ${is_search_insta ? `<td>${donor.insta_url ? `<a class="instagram_link" href="${donor.insta_url}" target="_blank">Open Insta</a>` : ''}</td>` : ''}
            ${is_search_bluesky ? `<td>${donor.bluesky_url ? `<a class="blueSky_link" href="${donor.bluesky_url}" target="_blank">Open Bluesky</a>` : ''}</td>` : ''}
        </tr>`;
    }


    htmlContent += `
                            </tbody>
                        </table>
                    </body>
</html>`;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    //if (campaignSlug && campaignSlug.value) {
    //    // Create a URL object
    //    const parsedUrl = new URL(campaignSlug.value);
    //    // Extract the pathname
    //    const pathname = parsedUrl.pathname; // "/f/bla-bla"
    //    // Split the pathname into segments and get the last segment
    //    const lastSegment = pathname.split('/').pop(); // "bla-bla"
    //}

    var fileName = 'donors_' + createFileNameFromDate(new Date());//lastSegment;
    if (partIndex != undefined) {
        fileName += '_prt_' + (partIndex + 1);
    }
    if (downloadMode == 2) {
        fileName = 'Linkedin_' + fileName;
    }
    fileName += '.html';

    // Create a link element and trigger the download
    //createLinkAndDownload(url, fileName);

    saveObjectUrl(url, fileName);
}

function createLinkAndDownload(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function downloadHTMLFileWithMinConnections() {
    await downloadHTMLFile(undefined, undefined, undefined, undefined, true);
}

async function downloadHTMLDistributedFiles(numberOfFiles, filterWithMinConnections) {
    var sort_dir = 'desc';
    var sort_prop = 'amountUSD';
    const jsonArray = singleDonors.sort((a, b) => sort_dir == 'desc' ? b[sort_prop] - a[sort_prop] : a[sort_prop] - b[sort_prop]);

    const distributedArrays = distributeItems(jsonArray, numberOfFiles);
    for (var i = 0; i < distributedArrays.length; i++) {
        await downloadHTMLFile(distributedArrays[i], undefined, undefined, i, filterWithMinConnections);
    }
}

// Function to sort array by a given property
function sortArrayByProperty(property, sortDir) {
    global_donors.sort((a, b) => {
        // Check if the property is a date or a number
        const aValue = a[property];
        const bValue = b[property];

        // Sort ascending; to reverse, swap (aValue, bValue) in subtraction
        if (aValue < bValue) return sortDir == 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDir == 'asc' ? 1 : -1;
        return 0;
    });
}

// Event listener for elements with `data-sort`
document.querySelectorAll('[data-sort]').forEach(element => {
    element.addEventListener('click', function () {
        const sortProperty = element.getAttribute('data-sort');
        var sortDir = element.getAttribute('data-sort-dir') || 'desc';
        sortDir = sortDir == 'asc' ? 'desc' : 'asc'
        element.setAttribute('data-sort-dir', sortDir);
        sortArrayByProperty(sortProperty, sortDir);

        // Select all elements with `data-sort` attribute
        const elements = document.querySelectorAll('[data-sort]');

        // Filter out elements where `data-sort` is not equal to "amount"
        const filteredElements = Array.from(elements).filter(element => element.getAttribute('data-sort') !== sortProperty);

        filteredElements.forEach(element => {
            element.setAttribute('data-sort-dir', '');
        });

        fillListHtml();
    });
});

function logAndArea(msg){
    console.info(msg);
    if (areaLog) {
        if (!areaLog.value) {
            areaLog.value = '';
        }
        areaLog.value += '\n--------------------------------\n' + msg;
        areaLog.scrollTop = areaLog.scrollHeight;
    }
}

function formatDateToDDMMYYYY(date) {
    if (!date) {
        return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

function formatToDateTime(date) {
    // Extract date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Get hours and convert to 12-hour format
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Determine AM or PM suffix
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12'; // the hour '0' should be '12'

    // Format the date as DD-MM-YYYY HH:MM:SS AM/PM
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function createFileNameFromDate(date) {
    var fileName = formatToDateTime(date);
    fileName = fileName.replace(/[\/\s:]/g, (match) => {
        if (match === '/') return '-';
        if (match === ' ') return '_';
        if (match === ':') return '_';
    });
    return fileName;
}

// Function to download JSON data as a file
function downloadJSON(data, filename) {
    // Convert JSON data to a string
    const jsonString = JSON.stringify(data, null, 2); // Pretty-print with 2 spaces

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); // Create a URL for the Blob
    link.download = filename; // Set the file name

    // Append the link to the body (required for Firefox)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}

function load_global_donors(fileName) {
    fileName = fileName || 'global_donors.json';
    fileName = 'loadsSamples/' + fileName;
    fetch(fileName) // Specify the path to your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            global_donors = data;
            global_donors.forEach((e, i) => {
                e.last_donation_date = new Date(e.last_donation_date);
                if (e.donation_details) {
                    e.donation_details.forEach((f) => f.donation_date = new Date(f.donation_date));
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function load_single_donors(fileName) {
    fileName = fileName || 'singleDonors.json';
	fileName = 'loadsSamples/' + fileName;
    fetch(fileName) // Specify the path to your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            singleDonors = data;
            singleDonors.forEach((e, i) => {
                e.last_donation_date = new Date(e.last_donation_date);
                if (e.donation_details) {
                    e.donation_details.forEach((f) => f.donation_date = new Date(f.donation_date));
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function getFailureReasonStats() {
    return global_donors.reduce((acc, item) => {
        var obj = acc.find(x => x.failureReason == item.failureReason);
        if (!obj) {
            acc.push({ failureReason: item.failureReason, cnt: 1 });
        } else {
            obj.cnt++;
        }
        return acc;
    }, []);
}

function getFailureReasonByKey(key) {
    return global_donors.filter(x => x.failureReason == key);
}

function getOneNotGoodMapped() {
    return getOneNotGood().map(x => ({ name: x.name, failureReason: x.failureReason }));
}

function getOneNotGood() {
    return global_donors.filter(x => x.cnt == -1);
}

function distributeItems(jsonArray, numberOfArrays) {
    // Initialize x empty arrays
    const result = Array.from({ length: numberOfArrays }, () => []);

    // Loop through each item in the jsonArray
    jsonArray.forEach((item, index) => {
        // Determine which array to push the item into
        const targetArrayIndex = index % numberOfArrays;
        result[targetArrayIndex].push(item);
    });

    return result;
}

function getInstagramSingleDonors(donors) {
    donors = donors || singleDonors;
    return donors.filter(x => x.insta_url);
}

function getBlueSkySingleDonors(donors) {
    donors = donors || singleDonors;
    return donors.filter(x => x.bluesky_url);
}

function getLinkedInSingleDonors(donors) {
    donors = donors || singleDonors;
    return donors.filter(x => x.url);
}

function getInAllSingleDonors(donors) {
    donors = donors || singleDonors;
    return donors.filter(x => x.url && x.insta_url);
}


function downloadInstagramHTMLFile(donors, sort_prop, sort_dir, partIndex) {
    donors = donors || getInstagramSingleDonors();
    donors = _.cloneDeep(donors);

    sort_prop = sort_prop || 'amountUSD';
    sort_dir = sort_dir || 'desc';

    donors = donors.sort((a, b) => sort_dir == 'desc' ? b[sort_prop] - a[sort_prop] : a[sort_prop] - b[sort_prop]);
    // Create the HTML structure
    let ScriptOpenningTag = "<" + "script>";
    let ScriptClosingTag = "</" + "script > ";
    let htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Instagram Donors List</title>
                            <style>
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }

                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                }

                                th {
                                    background-color: #f2f2f2;
                                }

                                .visited-row {
                                    background-color: #000;
                                    color: #fff;
                                }

                                    .visited-row a {
                                        color: #fff;
                                    }
                                    .pr_address{
                                        font-size:12px;
                                        margin-top: 5px;
                                        color: #3300ff;
                                    }
                            </style>


                        ${ScriptOpenningTag}
                            document.addEventListener("DOMContentLoaded", function () {
                                document.querySelectorAll('a').forEach((e, i) => {
                                    e.addEventListener("click", function (e) {
                                        try {
                                            // Prevents the default action (e.g., following the link)
                                            e.preventDefault();
                                            var tr = this.closest('tr');
                                            tr.classList.add('visited-row');
                                            window.open(this.href);
                                        } catch (error) {
                                            //alert(error);
                                        }
                                    });
                               });
                            });
                        ${ScriptClosingTag}

                    </head>
                    <body>
                        <h2><strong>Instagram Donors List:</strong> ${donors.length} donors found</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Profile</th>
                                </tr>
                            </thead>
                            <tbody>
                                `;

    // Loop through the donors and add rows
    donors.forEach((donor, i) => {
        var global_donor = global_donors[donor.global_index];
        donor.name = global_donor.name;
        donor.amountUSD = global_donor.amountUSD;
        donor.last_donation_date = global_donor.last_donation_date;

        htmlContent += `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${donor.name}</td>
                                    <td>${Math.round(donor.amountUSD)/*sumAndFormatDonations(donor.donation_details)*/}</td>
                                    <td>${formatToDateTime(donor.last_donation_date)}</td>
                                    <td><a href="${donor.insta_url}" target="_blank">Open</a></td>
                                </tr>`;
    });

    htmlContent += `
                            </tbody>
                        </table>
                    </body>
</html>`;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger the download
    //const a = document.createElement('a');
    //a.href = url;

    //if (campaignSlug && campaignSlug.value) {
    //    // Create a URL object
    //    const parsedUrl = new URL(campaignSlug.value);
    //    // Extract the pathname
    //    const pathname = parsedUrl.pathname; // "/f/bla-bla"
    //    // Split the pathname into segments and get the last segment
    //    const lastSegment = pathname.split('/').pop(); // "bla-bla"
    //}

    var fileName = 'Instagram_donors_' + createFileNameFromDate(new Date());//lastSegment;
    if (partIndex != undefined) {
        fileName += '_prt_' + (partIndex + 1);
    }

    //a.download = fileName + '.html';
    //document.body.appendChild(a);
    //a.click();
    //document.body.removeChild(a);
	
    saveObjectUrl(url, fileName + '.html');
}


function replaceNonEnglishChars(input) {
    // Create a mapping of non-English characters to their English equivalents
    const charMap = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a',
        'ç': 'c', 'č': 'c', 'ć': 'c',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i',
        'ñ': 'n', 'ń': 'n',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o', 'ō': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
        'ý': 'y', 'ÿ': 'y',
        'š': 's', 'ś': 's',
        'ž': 'z', 'ź': 'z', 'ż': 'z',
        'æ': 'ae', 'œ': 'oe',
        'ß': 'ss'
    };

    // Convert the input string into an array of characters
    const chars = input.split('');

    // Replace each character using charMap if it exists
    const result = chars.map(char => charMap[char] || char).join('');

    return result;
}

function format_search_keyword(search_keyword) {
    return replaceNonEnglishChars(search_keyword.trim()).toLocaleLowerCase();
}

// JavaScript function to get the last segment of a URL
function getLastUrlSegment(url) {
    const parts = url.split('/').filter(segment => segment !== "");
    return parts.length > 0 ? parts[parts.length - 1] : null;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveObjectUrl(jsonUrl, fileName) {
    chrome.downloads.download({
        url: jsonUrl,
        filename: 'DonorsResults/' + fileName, // The folder structure will appear in the user's downloads folder
        conflictAction: 'overwrite' // Overwrites if the file already exists
    }, () => {
        console.log('JSON file saved!');
    });
}

function get_last_donation_date(donors) {
    return getMaxDate(donors.map(x => new Date(x.last_donation_date)));
}

function getMaxDate(array) {
    if (!array || array.length === 0) {
        return null; // Handle empty or undefined array
    }

    // Use reduce to find the object with the maximum date
    const maxDate= array.reduce((max, current) =>
        current > max ? current : max
    );

    return maxDate; // Return the maximum date
}

function getCurrentMonthStart(){
	const now = new Date();
    const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0);//new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
	return startOfMonth; // e.g. 2025-07-01T00:00:00.000Z
}

async function getDonationsSinceMonthStart(camp_url){
	var fromDate = getCurrentMonthStart();
    return getDonationsInPeriod(camp_url, fromDate);
}

async function getDonationsInPeriod(camp_url, fromDate, toDate) {//new Date('2025-07-01T00:00:00.000Z')
    toDate = toDate || new Date();
	rates = await getRatesFromStorage();
    const periodDonors = await get_donors_from_to(camp_url, fromDate, toDate);
    const periodDonorsTotalAmount = periodDonors.reduce((sum, item) => sum + item.amountUSD, 0);
    return Object({
        FromDate: fromDate,
        ToDate: toDate,
        PeriodDonors: periodDonors,
        PeriodDonorsTotalAmount: periodDonorsTotalAmount,
        PeriodDonorsCount: periodDonors.length
	});
}


async function downloadPeriodGlobalDonorsHTMLFile(donorsResult, sort_prop, sort_dir, addPhoto) {
    var donors = donorsResult.PeriodDonors;
    sort_prop = sort_prop || 'last_donation_date';
    sort_dir = sort_dir || 'desc';

    donors = donors.sort((a, b) => {
        var com_result = 0;
        if (sort_dir == 'desc') {
            com_result = b[sort_prop] - a[sort_prop];
        } else {
            com_result = a[sort_prop] - b[sort_prop];
        }
        return com_result;
    });

    if (addPhoto == true) {
        for (let index = 0; index < donors.length; index++) {
            console.info(`Adding photo for person ${index} of ${donors.length}`);
            var item = donors[index];
            var resp = await get_linkedin_user(item.name);
            await delay(delayMs);
            if (resp?.user != null) {
                item.linkedin_image_url = resp.user.linkedin_image_url;
            }
        }
    }

    // Create the HTML structure
    let ScriptOpenningTag = "<" + "script>";
    let ScriptClosingTag = "</" + "script > ";
    let htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Donors List</title>
                            <style>
                                .filter_div{
                                    margin-bottom: 10px;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }

                                th, td {
                                    border: 1px solid #ddd;
                                    padding: 8px;
                                    text-align: left;
                                }

                                th {
                                    background-color: #f2f2f2;
                                }
                                ${image_css}
                            </style>


                        ${ScriptOpenningTag}
                           
                        ${ScriptClosingTag}

                    </head>
                    <body>
                        <h2><strong>From Date:</strong> ${formatToDateTime(donorsResult.FromDate)}</h2>
                        <h2><strong>To Date:</strong> ${formatToDateTime(donorsResult.ToDate)}</h2>
                        <h2><strong>Total Amount $:</strong> ${donorsResult.PeriodDonorsTotalAmount}</h2>
                        <h2><strong>Donors Count:</strong> ${donorsResult.PeriodDonorsCount}</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Photo</th>
                                    <th>Amount</th>
                                    <th>Times</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                `;

    // Loop through the donors and add rows
    for (let i = 0; i < donors.length; i++) {
        const donor = donors[i];

        const images = await renderSocialImage(donor.linkedin_image_url, 'LinkedIn', donor.name, donor.url, false);

        htmlContent += `
        <tr>
            <td>${i + 1}</td>
            <td>${donor.name}</td>
            <td class="img_td">
                ${images ? images : `<div class="empty_img"></div>`}
            </td>
            <td>$ ${Math.round(donor.amountUSD)}</td>
            <td>${donor.donation_times}</td>
            <td>${formatToDateTime(donor.last_donation_date)}</td>
        </tr>`;
    }


    htmlContent += `
                            </tbody>
                        </table>
                    </body>
</html>`;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    var fileName = 'donors_' + createFileNameFromDate(new Date());//lastSegment;
    
    fileName += '.html';

    saveObjectUrl(url, fileName);
}


function getCountryObjByCode(countryCode) {
    var x = countiesCodes.find(x => x.alpha_2.toLowerCase() == countryCode);
    if (!x) {
        return {
            name: countryCode,
            code: countryCode,
            name: countryCode,
            region_code: "0",
            is_arab_country: true,
            richness_rank: 999
        };
    }
    return ({
        name: x.name,
        code: countryCode,
        name: x.name,
        region_code: x.region_code,
        is_arab_country: x.is_arab_country,
        richness_rank: x.richness_rank
    });
}