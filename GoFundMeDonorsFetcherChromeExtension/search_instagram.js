async function search_donors_in_instagram() {
    var insta_result = [];
    for (var i = 0; i < global_donors.length; i++) {
        var username_result = await get_instagram_user(global_donors[i].name);
        if (username_result) {
            insta_result.push({ global_index: i, username: username_result, insta_url: 'https://www.instagram.com/' + username_result });
        }
        singleDonors.push(insta_result);
    }
    return insta_result
}

async function get_instagram_user(userFullName) {

    var users = await search_instagram_user(userFullName);

    var userFullNameLower = replaceNonEnglishChars(userFullName).toLocaleLowerCase();
    var filterdUsers = users.filter(x => replaceNonEnglishChars(x.full_name).toLocaleLowerCase() == userFullNameLower);
    if (filterdUsers.length == 1) {
        var user = filterdUsers[0];
        return user.username;
    }
    return null;
}

async function search_instagram_user(search_keyword) {
    try {
        var resp = await fetch("https://www.instagram.com/graphql/query", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "content-type": "application/x-www-form-urlencoded",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "light",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"131.0.6778.110\", \"Chromium\";v=\"131.0.6778.110\", \"Not_A Brand\";v=\"24.0.0.0\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"10.0.0\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-asbd-id": "129477",
                "x-bloks-version-id": "7cebebfbaf5374ad12812342f99c7eb8d130e7e3bb5db252249c30a04cc54795",
                "x-csrftoken": "ptjB_Es43Nl6ohRVoziks_",
                "x-fb-friendly-name": "PolarisSearchBoxRefetchableQuery",
                "x-fb-lsd": "oM8WYL0qlV9IzsMx4a_ppO",
                "x-ig-app-id": "936619743392459"
            },
            "referrer": "https://www.instagram.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "av=17841465918755296&__d=www&__user=0&__a=1&__req=50&__hs=20072.HYP%3Ainstagram_web_pkg.2.1.0.0.1&dpr=1&__ccg=GOOD&__rev=1018888255&__s=j3sqb5%3Alkrwnc%3A4o51rg&__hsi=7448637700658356424&__dyn=7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJxS0k24o1DU2_CwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2iyo7u3ifK0EUjwGzEaE2iwNwmE7G4-5o4q3y1Sw5XCwLyESE7i3vwDwHg2ZwrUdUbGwmk0zU8oC1Iwqo5q3e3zhA6bwIxeUnAwCAxW1oCz8rwHwGwa6EymUhw&__csr=gB0DYhf3OaOIjRTsjcBiTFA9AQynaRH9mDAAGL9uXQZeVfLhGmyajqqyF6BUyKuqAibBGiXp6GXDVlzuqGjjhahqCh-XzECAbAyVVHzGhWWi-4UyVkmdhp8yHAQmlyqADUKEWHDCAK8K5pKm4aq8Fm-az8Bprgy00jWSu13wyCwwGdwf6260ty0Uo5-1GgGU10Uz85oao610Rw1BC0Io0C2mO041w22VGdc0ket6gG0QRgyamEdkbQ4r8mcua8itsu0EQdwpIg8wppBeF9Ah1i36E5O4Ud0C9kM5aGwmER0Dyj09l09yum0BU6h0Dc1nwxw1mupk01Dww2vo1uo&__comet_req=7&fb_dtsg=NAcNF96WpZBdFXSFZOOh0vVOdqm8ElPI1ogG4DSDgdXOhSRuW-CcdMg%3A17843676607167008%3A1734137678&jazoest=26133&lsd=oM8WYL0qlV9IzsMx4a_ppO&__spin_r=1018888255&__spin_b=trunk&__spin_t=1734271110&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisSearchBoxRefetchableQuery&variables=%7B%22data%22%3A%7B%22context%22%3A%22blended%22%2C%22include_reel%22%3A%22true%22%2C%22query%22%3A%22" + search_keyword + "%22%2C%22rank_token%22%3A%221734271357639%7C047c37707904581e543207cbb6382fa19dd04ba77861641eb70d7d69e590f5f1%22%2C%22search_surface%22%3A%22web_top_search%22%7D%2C%22hasQuery%22%3Atrue%7D&server_timestamps=true&doc_id=9153895011291216",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        var resp = await resp.json();

        return resp.data.xdt_api__v1__fbsearch__topsearch_connection.users.map(x => x.user);

    }
    catch (error) {
        console.info('Error searching instagram:', error);
        return [];
    }
}