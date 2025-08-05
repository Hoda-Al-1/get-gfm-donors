async function search_donors_in_linkedin() {
    var linkedin_result = [];
    for (var i = 0; i < global_donors.length; i++) {
        var user_result = await get_linkedin_user(global_donors[i].name);
        if (user_result.ajax_success == true) {
            var user = user_result.user;
            if (user) {
                linkedin_result.push({ global_index: i, name: user.name, url: user.url });
            }
        }
        singleDonors = linkedin_result;
    }
    return linkedin_result
}

async function get_linkedin_user(userFullName) {

    var users = await search_linkedin_user(userFullName);

    //return users;
    if (users == null) {//error
        return { ajax_success: false, user: null };
    }

    if (users.length == 1) {
        var _user = users[0];
        var userFullNameLower = replaceNonEnglishChars(userFullName).toLocaleLowerCase();
        if (replaceNonEnglishChars(_user.name).toLocaleLowerCase() == userFullNameLower) {
            _url = new URL(_user.url);
            if (!_url.pathname.includes("people")) {
                // Return a new object with the cleaned URL
                _user.url = _url.origin + _url.pathname;
                return { ajax_success: true, user: _user };
            }
        }
    }
    return { ajax_success: true, user: null };
}

function extractLinkedInSlug(url) {
    const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
    return match ? match[1] : null;
}

async function get_linkedin_profile_image(search_keyword, publicIdentifier) {
    var resp = await search_linkedin_user(search_keyword);
    return resp.find(x => extractLinkedInSlug(x.url) == publicIdentifier);
}

async function search_linkedin_user(search_keyword) {
    try {
        var resp = await fetch("https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:SWITCH_SEARCH_VERTICAL,query:(keywords:" + search_keyword + ",flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.cd5ee9d14d375bf9ca0596cfe0cbb926", {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "csrf-token": "ajax:6796958486056805975",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-li-lang": "en_US",
                "x-li-page-instance": "urn:li:page:d_flagship3_search_srp_people;qJTJp3FvTUKH/gLhbHJahQ==",
                "x-li-pem-metadata": "Voyager - People SRP=search-results",
                "x-li-track": "{\"clientVersion\":\"1.13.28248.2\",\"mpVersion\":\"1.13.28248.2\",\"osName\":\"web\",\"timezoneOffset\":2,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
                "x-restli-protocol-version": "2.0.0"
            },
            "referrer": "https://www.linkedin.com/search/results/all/?keywords=Fiona%20Cobain&origin=TYPEAHEAD_ESCAPE_HATCH&sid=Izu",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        var resp = await resp.json();
        //

        return resp.included.filter(x => x.$type == "com.linkedin.voyager.dash.search.EntityResultViewModel")
            .map(x => {
                var _profile_image_url;
                try {
                    _profile_image_url = x.image.attributes[0].detailData.nonEntityProfilePicture.vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
                } catch (error) {
                    console.info('Error getting linkedin image:', error);
                }
                return ({
                    name: x.title.text,
                    url: x.navigationUrl,
                    secondarySubtitle: x.secondarySubtitle.text,
                    linkedin_image_url: _profile_image_url
                });
            });

    }
    catch (error) {
        console.info('Error searching linkedin:', error);
        return null;
    }
}

async function get_linkedin_profile_details(publicIdentifier) {

    try {
        var resp = await fetch("https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(vanityName:" + publicIdentifier + ")&queryId=voyagerIdentityDashProfiles.006f9921d016ba6bbed83dcb9e8bcab8", {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "csrf-token": "ajax:6796958486056805975",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-li-lang": "en_US",
                "x-li-page-instance": "urn:li:page:d_flagship3_profile_view_base;d04gE2hiRKKb8vnDcWyKxQ==",
                "x-li-pem-metadata": "Voyager - Profile=profile-top-card-supplementary",
                "x-li-track": "{\"clientVersion\":\"1.13.28248.2\",\"mpVersion\":\"1.13.28248.2\",\"osName\":\"web\",\"timezoneOffset\":2,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
                "x-restli-protocol-version": "2.0.0"
            },
            "referrer": "https://www.linkedin.com/in/fiona-cobain-41b858145/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        resp = await resp.json();

        return resp.included.filter(x => x.$type == "com.linkedin.voyager.dash.identity.profile.Profile" && x.publicIdentifier == publicIdentifier)
            .map(x => ({
                connections: x.connections.paging.total,
                countryCode: x.location.countryCode,
                country: getCountryObjByCode(x.location.countryCode)
            }))[0];

    }
    catch (error) {
        console.info('Error searching linkedin:', error);
        return [];
    }

}
//--------------------------------------------------------------------------------

function extractLinkedInActivityOrPostUrn(urlOrUrn) {
    var match = urlOrUrn.match(/ugcPost-(\d+)-/) || urlOrUrn.match(/ugcPost:(\d+)/);
    if (match && match[1]) {
        return `urn:li:ugcPost:${match[1]}`;
    }
    match = urlOrUrn.match(/activity-(\d{+})/) || urlOrUrn.match(/activity:(\d+)/);
    if (match && match[1]) {
        return `urn:li:activity:${match[1]}`;
    }
    return null;
}

async function getAndDownloadPostReactedPersons(urlOrUrn, filterData) {
    var persons = await getPostReactedPersons(urlOrUrn, filterData);
    console.info(persons);
    downloadPostReactedPersons(persons);
}

async function getPostReactedPersons(urlOrUrn, filterData) {

    if (filterData == undefined) {
        filterData = true;
    }
    /*
    temp2.included.filter(x=>x.$type =="com.linkedin.voyager.dash.social.Reaction").map(x=> Object({
    name: x.reactorLockup.title.text,
    profileUrl: x.reactorLockup.navigationUrl,
    relation: x.reactorLockup.label.text
    }))
    */
    const rowsPerPage = 10;
    var start = 0;
    var persons = [];
    var activityOrPostUrn = extractLinkedInActivityOrPostUrn(urlOrUrn);
    var activityOrPostUrnEncoded = encodeURIComponent(activityOrPostUrn);
    console.log('activityOrPostUrn:');
    console.log(activityOrPostUrn);
    console.log(activityOrPostUrnEncoded);
    var hasNext = true;
    while (hasNext) {
        try {
            const response = await fetch(`https://www.linkedin.com/voyager/api/graphql?variables=(count:${rowsPerPage},start:${start},threadUrn:${activityOrPostUrnEncoded})&queryId=voyagerSocialDashReactions.41ebf31a9f4c4a84e35a49d5abc9010b`, {
                "headers": {
                    "accept": "application/vnd.linkedin.normalized+json+2.1",
                    "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                    "csrf-token": "ajax:6796958486056805975",
                    "priority": "u=1, i",
                    "sec-ch-prefers-color-scheme": "light",
                    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-li-lang": "en_US",
                    "x-li-page-instance": "urn:li:page:d_flagship3_company_posts;4XOXjO7PQSyvfqLZQ/6r7Q==",
                    "x-li-pem-metadata": "Voyager - Feed - Reactors List=reactors-list",
                    "x-li-track": "{\"clientVersion\":\"1.13.37532\",\"mpVersion\":\"1.13.37532\",\"osName\":\"web\",\"timezoneOffset\":3,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
                    "x-restli-protocol-version": "2.0.0"
                },
                "referrer": "https://www.linkedin.com/company/learn-quran-online-from-home/posts/?feedView=all",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });

            var data = await response.json();



            var new_persons = data.included.filter(x => x.$type == "com.linkedin.voyager.dash.social.Reaction")
                .map(x => {
                    var _profileUrl = x.reactorLockup.navigationUrl;
                    var _name = x.reactorLockup.title.text;

                    var _profile_image_url;

                    try {
                        var vectorImage = x.reactorLockup.image.attributes[0].detailData.nonEntityProfilePicture.vectorImage;
                        var rootUrl = vectorImage.rootUrl;
                        var artifacts = vectorImage.artifacts;
                        var selectedartifact = artifacts.find(y => y.fileIdentifyingUrlPathSegment.includes("200_200")) || artifacts[0];
                        var fileIdentifyingUrlPathSegment = selectedartifact.fileIdentifyingUrlPathSegment;
                        _profile_image_url = rootUrl + fileIdentifyingUrlPathSegment;
                    } catch (error) {
                        console.info('Error getting linkedin image: for: (' + _name + ') , ' + _profileUrl, error + ', in where start: ' + start);
                        console.info(x);
                        console.info('------------------------------------------------------');
                    }
                    return ({
                        name: _name,
                        profileUrl: _profileUrl,
                        relation: x.reactorLockup.label.text,
                        linkedin_image_url: _profile_image_url,
                        otherData: null
                    });
                });



            persons = persons.concat(new_persons);

            var totalPages = data.data.data.socialDashReactionsByReactionType.paging.total;

            // Check if there are more pages
            start += rowsPerPage;
            hasNext = start < totalPages;

        } catch (error) {
            console.error('Error fetching donors:', error);
            hasNext = false; // Stop if there's an error
        }
    }
    for (var i = 0; i < persons.length; i++) {
        console.info(`Adding country for person ${i} of ${persons.length}`);
        persons[i].otherData = await getProfileDetailsByPublicUrn(persons[i].profileUrl);
    }
    if (filterData) {
        var needed_region_code = [
            "150",//Europe
            "009"//Oceania
        ];
        console.log('persons before filter:');
        console.log(persons);
        persons = persons.filter(x => needed_region_code.includes(x.otherData?.country?.region_code) || x.otherData?.countryCode == 'us' || x.otherData?.countryCode == 'ca');
    }
    return persons;
}

function extractLinkedInProfileId(url) {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
  return match ? match[1] : null;
}

async function getPublicIdentifierFromUrn(profileUrnFullUrl){
	var profileUrn = extractLinkedInProfileId(profileUrnFullUrl);
	try{
		const response = await fetch(`https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(profileUrn:urn%3Ali%3Afsd_profile%3A${profileUrn})&queryId=voyagerIdentityDashProfileCards.6c5f6655d1a58153236c798901cd0c56`, {
  "headers": {
    "accept": "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9,ar;q=0.8",
    "csrf-token": "ajax:6796958486056805975",
    "priority": "u=1, i",
    "sec-ch-prefers-color-scheme": "light",
    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-li-lang": "en_US",
    "x-li-page-instance": "urn:li:page:d_flagship3_profile_view_base;8LcF9DfKS3GmStQIaCINrQ==",
    "x-li-pem-metadata": "Voyager - Profile=profile-cards-right-rail",
    "x-li-track": "{\"clientVersion\":\"1.13.37454\",\"mpVersion\":\"1.13.37454\",\"osName\":\"web\",\"timezoneOffset\":3,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
    "x-restli-protocol-version": "2.0.0"
  },
  "referrer": "https://www.linkedin.com/in/ACoAAC3pbb8BcsygbNQT0qCzKp9xWP9-K9OnxYE/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
		
		var data = await response.json();
		
		return data.included.filter(x => x.entityUrn == `urn:li:fsd_profile:${profileUrn}`)[0].publicIdentifier;

        } catch (error) {
            console.error('Error fetching donors:', error);
        }
		return null;
}

async function getProfileDetailsByPublicUrn(profileUrnFullUrl){
	var publicProfileId = await getPublicIdentifierFromUrn(profileUrnFullUrl);
	return await get_linkedin_profile_details(publicProfileId)
}

async function getCountryByPublicUrn(profileUrnFullUrl){
	var publicProfileId = await getPublicIdentifierFromUrn(profileUrnFullUrl);
	return await  getCountryByPublicId(publicProfileId)
}

async function getCountryByPublicId(publicProfileId){
	try{
		const response = await fetch(`https://www.linkedin.com/voyager/api/graphql?variables=(vanityName:${publicProfileId})&queryId=voyagerIdentityDashProfiles.ee32334d3bd69a1900a077b5451c646a`, {
  "headers": {
    "accept": "application/vnd.linkedin.normalized+json+2.1",
    "accept-language": "en-US,en;q=0.9,ar;q=0.8",
    "csrf-token": "ajax:6796958486056805975",
    "priority": "u=1, i",
    "sec-ch-prefers-color-scheme": "light",
    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-li-lang": "en_US",
    "x-li-page-instance": "urn:li:page:d_flagship3_profile_view_base;8LcF9DfKS3GmStQIaCINrQ==",
    "x-li-pem-metadata": "Voyager - Profile=profile-top-card-core",
    "x-li-track": "{\"clientVersion\":\"1.13.37454\",\"mpVersion\":\"1.13.37454\",\"osName\":\"web\",\"timezoneOffset\":3,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
    "x-restli-protocol-version": "2.0.0"
  },
  "referrer": "https://www.linkedin.com/in/ACoAAC3pbb8BcsygbNQT0qCzKp9xWP9-K9OnxYE/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
		
		var data = await response.json();
		
		var result = data.included.find(x => x.hasOwnProperty('countryISOCode'));
		return Object({
			countryISOCode: result.countryISOCode,
			defaultLocalizedName: result.defaultLocalizedName
		});

        } catch (error) {
            console.error('Error fetching donors:', error);
        }
		return null;
}

function getCountryRichnessRank() {

}

async function downloadPostReactedPersons(arr) {

    arr = arr.sort((a, b) => {
        //const a_country = String(a.otherData?.countryCode || '');
        //const b_country = String(b.otherData?.countryCode || '');

        const a_rank = a.otherData?.country?.richness_rank;//String(a.otherData?.countryCode || '');
        const b_rank = b.otherData?.country?.richness_rank;//String(b.otherData?.countryCode || '');

        //// Prioritize 'US'
        //if (a_country === 'us' && b_country !== 'us') return -1;
        //if (a_country !== 'us' && b_country === 'us') return 1;

        // Default alphabetical sort
        var com_result = a_rank - b_rank;//a_country.localeCompare(b_country);
        if (com_result == 0) {
            const a_connections = String(a.otherData?.connections || 0);
            const b_connections = String(b.otherData?.connections || 0);
            com_result = b_connections - a_connections;
        }
        return com_result;
    });

    var i = 0;
    const rowsArray = await Promise.all(arr.map(async (item) => {
        const images = await renderSocialImage(item.linkedin_image_url, 'LinkedIn', item.name, item.profileUrl, false);
        return `
    <tr>
      <td>${(++i)}</td>
      <td>${item.name}</td>
      <td class="img_td">
        ${images ? images : `<div class="empty_img"></div>`}
      </td>
      <td><a href="${item.profileUrl}" target="_blank" rel="noopener noreferrer">open</a></td>
      <td>${item.relation}</td>
      <td>${item.otherData?.country?.name}</td>
      <td>${item.otherData?.connections || ''}</td>
    </tr>
  `;
    }));

    const rows = rowsArray.join('');

    let ScriptOpenningTag = "<" + "script>";
    let ScriptClosingTag = "</" + "script > ";

  var htmlContent =  `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profiles Table</title>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
          max-width: 600px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #eee;
        }
        ${image_css}
      </style>

        ${ScriptOpenningTag}
        function hide2nd(){
        const rows = document.querySelectorAll("table tr");
            rows.forEach(row => {
              const cells = row.querySelectorAll("td");
              cells.forEach(cell => {
                if (cell.textContent.trim() === "2nd") {
                  row.style.display = "none";
                }
              });
            });
        }

       function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
       }

		async function hideMale() {
    const rows = Array.from(document.querySelectorAll('table tbody tr'))
        .filter(row => row.offsetParent !== null && row.getAttribute("data-gender") !== "female");

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cell = row.querySelector("td:nth-child(1)");
        if (!cell) continue;

        const name = cell.textContent.trim();
        if (!name) continue;

        try {
            const response = await fetch(\`https://api.genderize.io?name=\${encodeURIComponent(name)}\`);
            const jsonData = await response.json();

            if (jsonData.gender === 'male') {
                row.style.display = "none";
            } else {
                row.setAttribute("data-gender", "female");
            }
        } catch (error) {
            console.error(\`Error fetching gender for "\${name}":\`, error);
        }
        await delay(1000);
    }
}


        ${ScriptClosingTag}

    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Image</th>
            <th>Profile</th>
            <th>Relation</th>
            <th>Country Code</th>
            <th>Connections</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    var fileName = 'post_recactors_' + createFileNameFromDate(new Date());//lastSegment;
    fileName += '.html';

    // Create a link element and trigger the download
    //createLinkAndDownload(url, fileName);

    saveObjectUrl(url, fileName);
}
//--------------------------------------------------------------------------------