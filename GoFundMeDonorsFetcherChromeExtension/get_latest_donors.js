function convertToDays() {
    // Get the input values
    const days = parseFloat(document.getElementById('days').value) || 0;
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;

    // Convert hours and minutes to days
    const totalDays = days + (hours / 24) + (minutes / 1440);

    // Display the result
    document.getElementById('resultDays').textContent = `${totalDays.toFixed(4)} days`;

    return totalDays;
}

btnConvetToDays.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    convertToDays();
});

btnGetLatestDonors.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form

    updateStatusBar();
    searchProgressMsg.innerHTML = '';

    areaLog.value = '';
    var days = convertToDays();
    await get_new_campiagns(1000);
    await get_latest_donors(days);
});

btnBreakSearch.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    break_search_c = true;
});

btnLoadSerchData.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    loadSerchData();
});

btnContinueSearch.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    if (index > 0) {
        index--;
    }
    await openLn();
});

let global_hits = [];
async function get_new_campiagns(daysAgo) {
    global_hits = [];
    logAndArea('Start Getting Campaigns .........');

    timeStart = getTimeStamp(daysAgo);

    let page = 0;
    let hasNext = true; // Pagination flag

    while (hasNext) {
        try {
            const response = await fetch("https://e7phe9bb38-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.17.0)%3B%20Browser%20(lite)%3B%20instantsearch.js%20(4.56.0)%3B%20react%20(18.2.0)%3B%20react-instantsearch%20(6.38.1)%3B%20react-instantsearch-hooks%20(6.38.1)%3B%20JS%20Helper%20(3.14.0)&x-algolia-api-key=2a43f30c25e7719436f10fed6d788170&x-algolia-application-id=E7PHE9BB38", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\""
                },
                "referrer": "https://www.gofundme.com/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": "{\"requests\":[{\"indexName\":\"prod_funds_feed_replica_1\",\"params\":\"analyticsTags=%5B%22platform%3Aweb%22%2C%22page%3Asrp%22%2C%22framework%3Anextjs%22%5D&aroundLatLngViaIP=false&attributesToHighlight=%5B%22fundname%22%2C%22username%22%2C%22bene_name%22%2C%22amount_to_goal%22%5D&attributesToRetrieve=%5B%22fundname%22%2C%22username%22%2C%22bene_name%22%2C%22amount_to_goal%22%2C%22objectID%22%2C%22thumb_img_url%22%2C%22url%22%2C%22balance%22%2C%22donation_count_full%22%2C%22currencycode%22%2C%22goal_progress%22%5D&clickAnalytics=true&exactOnSingleWordQuery=word&facets=%5B%5D&filters=status%3D1%20AND%20custom_complete%3D1%20AND%20has_redirect_url!%3D1%20AND%20timeout_start%3E" + timeStart + "&highlightPostTag=__%2Fais-highlight__&highlightPreTag=__ais-highlight__&hitsPerPage=48&page=" + page + "&query=gaza&tagFilters=&userToken=15ae9f2d-b873-4027-ac4f-45c4686fc5f9\"}]}",
                "method": "POST",
                "mode": "cors",
                "credentials": "omit"
            });

            const data = await response.json();

            const result = data.results[0];

            nbPages = result.nbPages;

            global_hits = global_hits.concat(result.hits);


            logAndArea('--------------------------------');
            //logAndArea(result.hits);
            logAndArea('result.hits:' + result.hits.length);
            logAndArea('global_hits:' + global_hits.length);

            // Check if there are more pages
            hasNext = page <= nbPages;

            // Increment offset for the next page
            page++;

        } catch (error) {
            console.error('Error fetching donors:', error);
            hasNext = false; // Stop if there's an error
        }
    }


    logAndArea('--------------------------------');

    logAndArea('final global_hits:' + global_hits.length);
    campaign_list = global_hits.map(x => x.url);
    return global_hits;
}

var latest_donors;
var break_search_c = false;
async function get_latest_donors(days) {
    logAndArea('Start Fetching Donors .........');
    btnBreakSearch.disabled = false;
    break_search_c = false;
    //days = days || 10;
    latest_donors = [];
    for (var i = 0; i < campaign_list.length; i++) {
        logAndArea(`Checking campaign ${i + 1} of ${campaign_list.length}, total_latest_donors_count: ${latest_donors.length}`);
        var e = campaign_list[i];
        let campaignSlug = getCampaignSlug(e);
        var campain_latest_donors = await get_donors(campaignSlug, days);

        var msg = `Result of campaign ${i + 1}, latest_donors count: ${campain_latest_donors.length}`;

        if (minAmount > 0) {
            campain_latest_donors = campain_latest_donors.filter(x => x.amount >= minAmount);
        }
        var maxStr = '';
        if (maxAmount > 0) {
            campain_latest_donors = campain_latest_donors.filter(x => x.amount <= maxAmount);
            maxStr = ` -- maxAmount = ${maxAmount}`;
        }
        msg += `, Filtered donors (minAmount = ${minAmount}${maxStr}) count: ${campain_latest_donors.length}`;

        logAndArea(msg);
        logAndArea('---------------------------------------------------------------------');

        latest_donors = latest_donors.concat(campain_latest_donors);

        if (break_search_c) {
            global_donors = [];
            latest_donors = [];
            break;
        }
    }

    btnBreakSearch.disabled = true;

    if (!break_search_c) {
        global_donors = megeAndGroupDonors(latest_donors);
        updateStatusBar();
        searchLinkedin();
    }
}

function saveSearchData() {
    var data = {
        globalDonors: global_donors,
        singleDonors: singleDonors,
        lastIndex: index
    };
    downloadJSON(data, 'searchData.json');
}

function loadSerchData(fileName) {
    fileName = fileName || 'searchData.json';
    fetch(fileName) // Specify the path to your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            global_donors = data.globalDonors;
            global_donors.forEach((e, i) => {
                e.last_donation_date = new Date(e.last_donation_date);
                if (e.donation_details) {
                    e.donation_details.forEach((f) => f.donation_date = new Date(f.donation_date));
                }
            });

            singleDonors = data.singleDonors;
            singleDonors.forEach((e, i) => {
                e.last_donation_date = new Date(e.last_donation_date);
                if (e.donation_details) {
                    e.donation_details.forEach((f) => f.donation_date = new Date(f.donation_date));
                }
            });

            index = data.lastIndex;

            updateStatusBar();

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function updateStatusBar() {
    searchProgressMsg.innerHTML = `<strong>Checking donor</strong> ${index + 1} <strong>of</strong> ${global_donors.length}`;
    document.getElementById('resultGlobalDonors').textContent = `${global_donors.length} donors`;
    resultMsg.innerHTML = `<strong> Found Donors:</strong> ${singleDonors.length} (${getLinkedInSingleDonors().length} in linkedIn + ${getInstagramSingleDonors().length} in instagram)`;
}