async function search_donors_in_linkedin() {
    var linkedin_result = [];
    for (var i = 0; i < global_donors.length; i++) {
        var username_result = await get_linkedin_user(global_donors[i].name);
        if (username_result) {
            linkedin_result.push({ global_index: i, name: username_result.name, url: username_result.url });
        }
        singleDonors = linkedin_result;
    }
    return linkedin_result
}

async function get_linkedin_user(userFullName) {

    var users = await search_linkedin_user(userFullName);

    //return users;

    if (users.length == 1) {

        var user = users[0];
        var userFullNameLower = replaceNonEnglishChars(userFullName).toLocaleLowerCase();
        if (replaceNonEnglishChars(user.name).toLocaleLowerCase() == userFullNameLower) {
            _url = new URL(user.url);
            if (!_url.pathname.includes("people")) {
                // Return a new object with the cleaned URL
                user.url = _url.origin + _url.pathname;
                return user;
            }
        }
    }
    return null;
}

async function search_linkedin_user(search_keyword) {
    try {
        var resp = await fetch("https://www.linkedin.com/voyager/api/graphql?variables=(start:0,origin:GLOBAL_SEARCH_HEADER,query:(keywords:" + search_keyword + ",flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE))),includeFiltersInResponse:false))&queryId=voyagerSearchDashClusters.cd5ee9d14d375bf9ca0596cfe0cbb926", {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "csrf-token": "ajax:5118546544084686507",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-li-lang": "en_US",
                "x-li-page-instance": "urn:li:page:d_flagship3_search_srp_people;CUH9MK9ARs+CaxK7vmy2wQ==",
                "x-li-pem-metadata": "Voyager - People SRP=search-results",
                "x-li-track": "{\"clientVersion\":\"1.13.27831\",\"mpVersion\":\"1.13.27831\",\"osName\":\"web\",\"timezoneOffset\":2,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
                "x-restli-protocol-version": "2.0.0"
            },
            "referrer": "https://www.linkedin.com/search/results/people/?keywords=" + search_keyword + "&origin=GLOBAL_SEARCH_HEADER&sid=X.f",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        var resp = await resp.json();
        //

        return resp.included.filter(x => x.$type == "com.linkedin.voyager.dash.search.EntityResultViewModel")
            .map(x => ({ name: x.title.text, url: x.navigationUrl, secondarySubtitle: x.secondarySubtitle.text }))

    }
    catch (error) {
        console.error('Error searching linkedin:', error);
        return [];
    }
}

async function get_linkedin_profile_details(publicIdentifier) {

    try {
        var resp = await fetch("https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(vanityName:" + publicIdentifier + ")&queryId=voyagerIdentityDashProfiles.00bac58ea0526a82dce3cbe7ee8ddc6d", {
            "headers": {
                "accept": "application/vnd.linkedin.normalized+json+2.1",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "csrf-token": "ajax:5118546544084686507",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-li-lang": "en_US",
                "x-li-page-instance": "urn:li:page:d_flagship3_profile_view_base;nmsE3qg7Q4+ZYVlIwwhmAw==",
                "x-li-pem-metadata": "Voyager - Profile=profile-top-card-supplementary",
                "x-li-track": "{\"clientVersion\":\"1.13.27831\",\"mpVersion\":\"1.13.27831\",\"osName\":\"web\",\"timezoneOffset\":2,\"timezone\":\"Africa/Cairo\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1080}",
                "x-restli-protocol-version": "2.0.0"
            },
            "referrer": "https://www.linkedin.com/in/adil-kortbi-5321bb1b2/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        resp = await resp.json();

        return resp.included.filter(x => x.$type == "com.linkedin.voyager.dash.identity.profile.Profile" && x.publicIdentifier == publicIdentifier)
            .map(x => ({ connections: x.connections.paging.total, countryCode: x.location.countryCode }))[0];

    }
    catch (error) {
        console.error('Error searching linkedin:', error);
        return [];
    }

}