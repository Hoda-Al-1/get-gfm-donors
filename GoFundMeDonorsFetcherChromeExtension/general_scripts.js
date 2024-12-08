
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

document.addEventListener('DOMContentLoaded', function () {
    console.info('DOM is fully loaded and parsed!');
  
    if (txtMinAmount) {
        minAmount = parseInt(txtMinAmount.value);
        txtMinAmount.addEventListener('input', function () {
            minAmount = parseInt(this.value);
        });
    }
    if (txtMaxAmount) {
        maxAmount = parseInt(txtMaxAmount.value);
        txtMaxAmount.addEventListener('input', function () {
            maxAmount = parseInt(this.value);
        });
    }
});


    // In the parent window
    window.addEventListener('message', messageEventHandler);

    function messageEventHandler(event) {
        //debugger
        console.info('Message from content.js');
    //if (event.origin !== 'http://your-origin.com') return; // Security check
    var data = event.data.data;
    if (event.data.type === 'responseData') {

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
            name: donor.name, url: data.url,
            amount: donor.amount,
            last_donation_date: donor.last_donation_date,
            last_donation_time_ago: timeAgo(donor.last_donation_date),
            email: '',
            connections: 0,
            address: '',
            is_ghost_image: data.is_ghost_image
        });
    if (checkEmail) {
        newWindow.location = data.url + '/overlay/contact-info/';
                        }
                        else if (minConnections > 0) {
        newWindow.location = data.url + '?action=chk_conn';
                        }
    else {
        storeSingleDonors(singleDonors);
                            //downloadHTMLFile();
                        }
                    }
    resultMsg.innerHTML = `<strong> Found Donors:</strong> ${singleDonors.length}`;
                }

    console.info('(data.cnt,existingDonor,checkEmail,minConnections)');
    console.info(data.cnt, existingDonor, checkEmail, minConnections);

    if (data.cnt != 1 || existingDonor || (!checkEmail && !minConnections)) {
        index++;
    openLn();
                }
            } else if (event.data.type === 'emailCheckData') {
                var _email = event.data.data.email || '';
    singleDonors[singleDonors.length - 1].email = _email;
    //downloadHTMLFile();
    storeSingleDonors(singleDonors);
    index++;
    openLn();
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
    openLn();
            }
        }

    function storeSingleDonors(singleDonors) {
        console.info('----start storeSingleDonors----------------------- index = ' + index);
    newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');
    console.info("newWindow.postMessage({type: 'sendSingleDonors', data: singleDonors }, '*');");
    //console.info(JSON.stringify(singleDonors));
    console.info('----end storeSingleDonors----------------------- index = ' + index);
        }

    function searchLinkedin() {
        downloadJSON(global_donors, 'global_donors.json');
    index = 0;
    singleDonors = [];
    resultMsg.innerHTML = '';
    searchProgressMsg.innerHTML = '';
    openLn();
        }

    function openLn() {
            var donorsLength = global_donors.length;
    if (index < donorsLength) {
        searchProgressMsg.innerHTML = `<strong>Checking donor</strong> ${index + 1} <strong>of</strong> ${global_donors.length}`;
    var donor = global_donors[index];
    var url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(donor.name)}&origin=GLOBAL_SEARCH_HEADER&sid=AfM&i=${index}&gdc=${global_donors.length}&agi=${allow_ghost_image}`;

    const features = '';//'width=1,height=1,left=-1000,top=-1000';
    if (!newWindow || newWindow.closed) {
        newWindow = window.open(url, '_blank', features);
                } else {
        newWindow.location = url;
                }
            } else {
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
    created_at: new Date(x.created_at)
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

            // Summing amounts for each unique donor
            const summedDonors = donors.reduce((acc, donor) => {
                // Check if the donor already exists in the accumulator
                const existingDonor = acc.find(d => d.name === donor.name);

    if (existingDonor) {
        // If donor exists, add the current amount to the existing total
        existingDonor.amount += donor.amount;
    existingDonor.donation_times++;
                    existingDonor.last_donation_date = existingDonor.last_donation_date > donor.created_at ? existingDonor.last_donation_date : donor.created_at;
                } else {
        // If donor doesn't exist, add a new entry to the accumulator
        acc.push({ name: donor.name, amount: donor.amount, currencycode: donor.currencycode, last_donation_date: donor.created_at, donation_times: 1 });
                }

    return acc;
            }, []);

            // Sort donors by amount in descending order
            summedDonors.sort((a, b) => b.amount - a.amount);

    return summedDonors;
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
                            <title>Donors List</title>
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
                        <h2><strong>Donors List:</strong> ${donors.length} donors found</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Ghost</th>
                                    <th>Date</th>
                                    ${checkEmail ? '<th>Email</th>' : ''}
                                    ${minConnections > 0 ? '<th>Connections</th>' : ''}
                                    <th>Profile</th>
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
                                    <td>${donor.is_ghost_image ? 'Yes' : 'No'}</td>
                                    <td>${formatToDateTime(donor.last_donation_date)}</td>
                                    ${checkEmail ? '<td>' + donor.email + '</td>' : ''}
                                    ${minConnections > 0 ? '<td>' + donor.connections + '</td>' : ''}
                                    <td><a href="${donor.url}" target="_blank">Open</a></td>
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

var fileName = 'donors_' + formatToDateTime(new Date());//lastSegment;
if (partIndex != undefined) {
    fileName += '_prt_' + (partIndex + 1);
}

a.download = fileName + '.html';
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
        areaLog.value += '\n' + msg;
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
            global_donors.forEach((e, i) => e.last_donation_date = new Date(e.last_donation_date));
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
            singleDonors.forEach((e, i) => e.last_donation_date = new Date(e.last_donation_date));
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