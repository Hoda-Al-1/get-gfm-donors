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
    areaLog.value = '';
    var days = convertToDays();
    await get_new_campiagns(1000);
    await get_latest_donors(days);
});

btnBreakSearch.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    break_search_c = true;
});

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
        global_donors = latest_donors;
        document.getElementById('resultGlobalDonors').textContent = `${global_donors.length} days`;
        searchLinkedin();
    }
}