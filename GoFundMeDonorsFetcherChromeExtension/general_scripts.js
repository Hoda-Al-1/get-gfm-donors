
    const linkinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" class="mercado-match" focusable="false">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
    </svg>`;

    var newWindow;
    var global_donors = [];
var singleDonors = [];
    var index = 0;
    var checkEmail = false;
    var minConnections = 10;
    var allow_ghost_image = 1;
var minAmount = 50;
var maxAmount = 0;
var is_search_linkedin = true;
var is_search_insta = true;
var userLinledInWidowSearch = false;
var delayMs = 15000;

document.addEventListener('DOMContentLoaded', function () {
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

    if (document.querySelector('#chkSearchLinkedIn')) {
        is_search_linkedin = chkSearchLinkedIn.checked;
        chkSearchLinkedIn.addEventListener('change', function () {
            is_search_linkedin = chkSearchLinkedIn.checked;
        });
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
                    amount: donor.amount,
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
                //existingDonor.amount = donor.amount;
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
            await openLn();
        }

    } else if (event.data.type === 'emailCheckData') {
        var _email = event.data.data.email || '';
        singleDonors[singleDonors.length - 1].email = _email;
        //downloadHTMLFile();
        storeSingleDonors(singleDonors);
        index++;
        await openLn();
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
        await openLn();
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
    console.info('----start storeSearchData----------------------- index = ' + index);

    chrome.storage.local.set({ searchData: searchData }, () => {
        console.info('chrome.storage.local set seachData');
        if (callback) {
            callback();
        }
    });
    // newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');
    //console.info("newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');");
    //console.info(JSON.stringify(singleDonors));
    console.info('----end storeSearchData----------------------- index = ' + index);
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

async function searchLinkedin() {
    downloadJSON(global_donors, 'global_donors.json');
    index = 0;
    singleDonors = [];
    resultMsg.innerHTML = '';
    searchProgressMsg.innerHTML = '';
    await openLn();
}

async function openLn() {
    var donorsLength = global_donors.length;

    updateStatusBar();
    saveSearchData();

    if (index < donorsLength) {

        var existingDonorLocal;

        var donor = global_donors[index];

        //if (is_search_insta && is_search_linkedin) {
            await delay(delayMs);
        //}

        if (is_search_insta) {

            //if (!is_search_linkedin) {
            //    await delay(delayMs);
            //}

            logAndArea(`searching instagram for (${donor.name}),donor index = ${index} ...`);
            var insta_user = await get_instagram_user(donor.name);
            if (insta_user) {
                existingDonorLocal = singleDonors.find(d => d.name === donor.name);
                if (!existingDonorLocal) {
                    var _insta_url = 'https://www.instagram.com/' + insta_user;
                    singleDonors.push({
                        global_index: index,
                        name: donor.name,
                        url: undefined,
                        insta_url: _insta_url,
                        amount: donor.amount,
                        last_donation_date: donor.last_donation_date,
                        last_donation_time_ago: timeAgo(donor.last_donation_date),
                        donation_times: donor.donation_times,
                        email: '',
                        connections: 0,
                        address: '',
                        is_ghost_image: undefined,
                        donation_details: donor.donation_details
                    });
                    global_donors.insta_url = _insta_url;
                }
                logAndArea(`donor found in instagram for (${donor.name}),donor index = ${index}`);
            }
        }

        if (is_search_linkedin) {
            if (!userLinledInWidowSearch) {

                //if (!is_search_insta) {
                //    await delay(delayMs);
                //}

                logAndArea(`searching linkedin for (${donor.name}),donor index = ${index} ...`);
                var linkedin_user = await get_linkedin_user(donor.name);
                if (linkedin_user) {
                    existingDonorLocal = singleDonors.find(d => d.name === donor.name);
                    var _is_ghost_image = linkedin_user.profile_image_url ? false : true;
                    var user_details = await get_linkedin_profile_details(getLastUrlSegment(linkedin_user.url));
                    if (!existingDonorLocal) {
                        logAndArea(`new donor found in linked for (${donor.name}),donor index = ${index}`);
                        var new_donor = {
                            global_index: index,
                            name: donor.name,
                            url: linkedin_user.url,
                            insta_url: undefined,
                            amount: donor.amount,
                            last_donation_date: donor.last_donation_date,
                            last_donation_time_ago: timeAgo(donor.last_donation_date),
                            donation_times: donor.donation_times,
                            email: '',
                            connections: 0,
                            address: linkedin_user.secondarySubtitle,
                            is_ghost_image: _is_ghost_image,
                            donation_details: donor.donation_details
                        };
                        if (user_details) {
                            new_donor.connections = user_details.connections;
                            new_donor.address += ' [' + user_details.countryCode?.toLocaleUpperCase() + ']';
                        }
                        singleDonors.push(new_donor);
                    }
                    else {
                        logAndArea(`new data in linked found for an existing (${donor.name}),donor index = ${index}`);
                        existingDonorLocal.url = linkedin_user.url;
                        existingDonorLocal.is_ghost_image = _is_ghost_image;
                        if (user_details) {
                            existingDonorLocal.connections = user_details.connections;
                            existingDonorLocal.address += linkedin_user.secondarySubtitle + ' [' + user_details.countryCode?.toLocaleUpperCase() + ']';
                        }
                    }
                    global_donors.url = linkedin_user.url;
                }
                index++;
                await openLn();
            }
            else {
                var url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(donor.name)}&origin=GLOBAL_SEARCH_HEADER&sid=AfM&i=${index}&gdc=${global_donors.length}&agi=${allow_ghost_image}`;

                const features = '';//'width=1,height=1,left=-1000,top=-1000';
                if (!newWindow || newWindow.closed) {
                    newWindow = window.open(url, '_blank', features);
                } else {
                    newWindow.location = url;
                }
            }

        } else {
            index++;
            await openLn();
        }

    }
    else {

        if (newWindow && !newWindow.closed) {
            //newWindow.close();
        }
        console.info('all donors looped !');
        if (singleDonors.length > 0) {

            // Call the function to download the CSV
            //downloadCSV(singleDonors);

            //storeSingleDonors(singleDonors);

            // Call the function to download the HTML file
            downloadHTMLFile();
        }
    }
}


    const xSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-lrsllp r-1nao33i r-16y2uox r-8kz0gk"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>`;
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


async function get_donors(camp_url, untilDays) {
    let donors = [];
    let offset = 0;
    const limit = 100; // Increased limit per page
    let hasNext = true; // Pagination flag

    while (hasNext) {
        try {
            const response = await fetch(`https://gateway.gofundme.com/web-gateway/v1/feed/${camp_url}/donations?limit=${limit}&offset=${offset}&sort=undefined`, {
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

            const data = await response.json();

            // Append new donations to the donors array
            var filtered = data.references.donations.filter(x => !x.is_anonymous);
            if (untilDays > 0) {
                filtered = filtered.filter(x => isWithinLastXDays(new Date(x.created_at), 0, untilDays));
            }

            const newDonors = filtered.map(x => ({
                name: x.name,
                amount: x.amount,
                currencycode: x.currencycode,
                created_at: new Date(x.created_at),
                camp_url: camp_url
            }));
            donors = donors.concat(newDonors);

            // Check if there are more pages
            hasNext = data.meta.has_next;

            if (untilDays > 0 && newDonors.length == 0) {
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
            existingDonor.amount += donor.amount;
            existingDonor.donation_details.push(donation_details);
            existingDonor.donation_times++;
            existingDonor.last_donation_date = existingDonor.last_donation_date > donor.created_at ? existingDonor.last_donation_date : donor.created_at;
        } else {
            // If donor doesn't exist, add a new entry to the accumulator
            acc.push({ name: donor.name, amount: donor.amount, currencycode: donor.currencycode, last_donation_date: donor.created_at, donation_times: 1, donation_details: [donation_details] });
        }

        return acc;
    }, []);//.sort((a, b) => b.amount - a.amount);
}

function megeAndGroupDonors(donors) {
    return donors.reduce((acc, donor) => {
        // Check if the donor already exists in the accumulator
        const existingDonor = acc.find(d => d.name === donor.name);

        if (existingDonor) {
            // If donor exists, add the current amount to the existing total
            existingDonor.amount += donor.amount;
            existingDonor.donation_details = existingDonor.donation_details.concat(donor.donation_details);
            existingDonor.donation_times += donor.donation_times;
            existingDonor.last_donation_date = existingDonor.last_donation_date > donor.last_donation_date ? existingDonor.last_donation_date : donor.last_donation_date;
        } else {
            // If donor doesn't exist, add a new entry to the accumulator
            acc.push({ name: donor.name, amount: donor.amount, currencycode: donor.currencycode, last_donation_date: donor.last_donation_date, donation_times: donor.donation_times, donation_details: donor.donation_details });
        }

        return acc;
    }, []).sort((a, b) => b.amount - a.amount);;
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

    // Calculate the difference in time (milliseconds)
    const differenceInTime = currentDate - givenDate;

    // Convert the time difference to days
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
    return differenceInDays >= minDays && differenceInDays <= maxDays;
}

    async function fetchDonors() {
            const campaignSlugInput = document.getElementById('campaignSlug').value;
    const donorListElement = document.getElementById('donorList');

    // Clear previous results
    donorListElement.innerHTML = '';

    const elements = document.querySelectorAll('[data-sort]');

            elements.forEach(element => {
        element.setAttribute('data-sort-dir', '');
            });

    let campaignSlug = getCampaignSlug(campaignSlugInput);

    if (campaignSlug) {
        // Show loader
        showLoader();

        global_donors = await get_donors(campaignSlug);

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
    <div>${donor.currencycode} ${donor.amount}</div>
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


function downloadHTMLFile(donors, sort_prop, sort_dir, partIndex, filterWithMinConnections) {
    donors = donors || singleDonors;

    if (filterWithMinConnections) {
        donors = _.cloneDeep(donors.filter(x => x.connections > minConnections));
    }

    sort_prop = sort_prop || 'amount';
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
                                var i = 1;
                                document.querySelectorAll('tbody tr').forEach((x)=> {
                                    if( (hasLinedIn && !x.querySelector('a.linkedin_link')) || (hasInsta && !x.querySelector('a.instagram_link')) ){
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
                        <div class="filter_div"><label><input class="chk_filter" id="chkHasLinkedIn" type="checkbox" /> Has LinkedIn</label> (${getLinkedInSingleDonors().length})</div>
                        <div class="filter_div"><label><input class="chk_filter" id="chkhasInsta" type="checkbox" /> Has Instagram</label> (${getInstagramSingleDonors().length})</div>
                        <div class="filter_div">Found In All (${getInAllSingleDonors().length})</div>
                       <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    ${is_search_linkedin ? '<th>Times</th>' : ''}
                                    ${is_search_linkedin ? '<th>Ghost</th>' : ''}
                                    <th>Date</th>
                                    ${is_search_linkedin && checkEmail ? '<th>Email</th>' : ''}
                                    ${is_search_linkedin && minConnections > 0 ? '<th>Connections</th>' : ''}
                                    ${is_search_linkedin ? '<th>LinkedIn</th>' : ''}
                                    ${is_search_insta ? '<th>Insta</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                `;

    // Loop through the donors and add rows
    donors.forEach((donor, i) => {
        htmlContent += `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${donor.name}<div class="pr_address">${donor.address}</div></td>
                                    <td>${donor.amount}</td>
                                    ${is_search_linkedin ? `<td>${donor.donation_times}</td>` : ''}
                                    ${is_search_linkedin ? `<td>${(donor.is_ghost_image ? 'Yes' : (donor.is_ghost_image == undefined ? '' : 'No'))}</td>` : ''}
                                    <td>${formatToDateTime(donor.last_donation_date)}</td>
                                    ${is_search_linkedin && checkEmail ? '<td>' + donor.email + '</td>' : ''}
                                    ${is_search_linkedin && minConnections > 0 ? '<td>' + (donor.url ? donor.connections : '') + '</td>' : ''}
                                    ${is_search_linkedin ? `<td>` + (donor.url ? `<a class="linkedin_link" href="${donor.url}" target="_blank">Open Ln</a>` : '') + `</td>` : ''}
                                    ${is_search_insta ? `<td>` + (donor.insta_url ? `<a class="instagram_link" href="${donor.insta_url}" target="_blank">Open Insta</a>` : '') + `</td>` : ''}
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
    const a = document.createElement('a');
    a.href = url;

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
    fileName += '.html';
    a.download = fileName;

    //saveObjectUrl(url, fileName);

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadHTMLFileWithMinConnections() {
    downloadHTMLFile(undefined, undefined, undefined, undefined, true);
}

function downloadHTMLDistributedFiles(numberOfFiles, filterWithMinConnections) {
    var sort_dir = 'desc';
    var sort_prop = 'amount';
    const jsonArray = singleDonors.sort((a, b) => sort_dir == 'desc' ? b[sort_prop] - a[sort_prop] : a[sort_prop] - b[sort_prop]);

    const distributedArrays = distributeItems(jsonArray, numberOfFiles);
    for (var i = 0; i < distributedArrays.length; i++) {
        downloadHTMLFile(distributedArrays[i], undefined, undefined, i, filterWithMinConnections);
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
    fileName = fileName.replace('/', '-');
    fileName = fileName.replace(/\s/g, '_');
    fileName = fileName.replace(':', '_');
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

function getInstagramSingleDonors() {
    return singleDonors.filter(x => x.insta_url);
}

function getLinkedInSingleDonors() {
    return singleDonors.filter(x => x.url);
}

function getInAllSingleDonors() {
    return singleDonors.filter(x => x.url && x.insta_url);
}


function downloadInstagramHTMLFile(donors, sort_prop, sort_dir, partIndex) {
    donors = donors || getInstagramSingleDonors();


    sort_prop = sort_prop || 'amount';
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
        donor.amount = global_donor.amount;
        donor.last_donation_date = global_donor.last_donation_date;
        donor.url = 'https://www.instagram.com/' + donor.username;

        htmlContent += `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${donor.name}</td>
                                    <td>${donor.amount}</td>
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
    const a = document.createElement('a');
    a.href = url;

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

    a.download = fileName + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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