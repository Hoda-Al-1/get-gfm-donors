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
                    profile_image_url: _profile_image_url
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
            .map(x => ({ connections: x.connections.paging.total, countryCode: x.location.countryCode }))[0];

    }
    catch (error) {
        console.info('Error searching linkedin:', error);
        return [];
    }

}