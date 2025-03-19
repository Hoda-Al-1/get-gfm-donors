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
                "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                "sec-ch-ua-full-version-list": "\"Not(A:Brand\";v=\"99.0.0.0\", \"Google Chrome\";v=\"133.0.6943.141\", \"Chromium\";v=\"133.0.6943.141\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"10.0.0\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-asbd-id": "359341",
                "x-bloks-version-id": "e7c968a852c20a5809af0f132c00310b0f6e633456328181b298a8955b4764e8",
                "x-csrftoken": "9hX0sdlDmcEd48Pj0AxHuB0IPRT8jd1s",
                "x-fb-friendly-name": "PolarisSearchBoxRefetchableQuery",
                "x-fb-lsd": "IrGpP7ovBw907-N1FlS5Pl",
                "x-ig-app-id": "936619743392459"
            },
            "referrer": "https://www.instagram.com/?hl=en",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "av=17841465918755296&hl=en&__d=www&__user=0&__a=1&__req=1d&__hs=20166.HYP%3Ainstagram_web_pkg.2.1...1&dpr=1&__ccg=GOOD&__rev=1021042250&__s=ffww4n%3Ah7usli%3Avkver1&__hsi=7483521275703166993&__dyn=7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJxS0DU2wx609vCwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2iyo7u3ifK0EUjwGzEaE2iwNwmE2eUlwhEe87q0oa2-azqwt8d-2u2J0bS1LwTwKG1pg2fwxyo6O1FwlA3a3zhA6bwIxeUnAwCAxW1oxe6UaU3cyVrx6&__csr=iMaI4Apd4hW8y4JEO8x2NdtJ-KAjGEzvllRDjmJr_KiqQuqhbKl5CjQ8Q8GhEx1DFlZ25LDmA8X-CHiGah8GutCiGHiKqiicgOEV1O48G-iEjCAy5WmqAmEHBWzoKeyUO46UFybzo9Q6p4qKF99WK4oKq8zRxrzoC6oHz8hh9Uy9Kcxe1sCG00iKOq0EpFQ9w6xw2aA0EU2d4jzWxqawGxq3kw1EoTg8qG0gu0daw1cG0h13UW48tBgHcEgJACgwi0L8kgF02fVVE0wp08_a0zoCq1mwk8kxevQu044obqxF6P037b801udw2883fw&__hsdp=&__hblp=&__comet_req=7&fb_dtsg=NAcOVJRGT7piaapo8XSJMbskPgQGDTrPYR2-4xy4f-2CXRMykmFomVQ%3A17865553615041151%3A1742393073&jazoest=26217&lsd=IrGpP7ovBw907-N1FlS5Pl&__spin_r=1021042250&__spin_b=trunk&__spin_t=1742393075&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisSearchBoxRefetchableQuery&variables=%7B%22data%22%3A%7B%22context%22%3A%22blended%22%2C%22include_reel%22%3A%22true%22%2C%22query%22%3A%22" + search_keyword + "%22%2C%22rank_token%22%3A%221742393091109%7Cf02e5cfb5226cc1b8d57798cd6b11d696d6f3321c4520e9037a79881f56c35e4%22%2C%22search_surface%22%3A%22web_top_search%22%7D%2C%22hasQuery%22%3Atrue%7D&server_timestamps=true&doc_id=9346396502107496",
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