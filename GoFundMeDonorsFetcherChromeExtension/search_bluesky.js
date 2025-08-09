async function search_donors_in_bluesky() {
    var bluesky_result = [];
    for (var i = 0; i < global_donors.length; i++) {
        var username_result = await get_bluesky_user(global_donors[i].name);
        if (username_result) {
            var donorObj = { global_index: i, username: username_result, bluesky_url: 'https://bsky.app/profile/' + username_result };
            singleDonors.push(donorObj);
			bluesky_result.push(donorObj)
		}
    }
    return bluesky_result;
}

async function get_bluesky_user(userFullName) {

    var users = await search_bluesky_user(userFullName);

    var userFullNameLower = format_search_keyword(userFullName);
    var filterdUsers = users.filter(x => format_search_keyword(x.displayName) == userFullNameLower);
    if (filterdUsers.length == 1) {
        var user = filterdUsers[0];
        return user;
    }
    return null;
}

async function get_bluesky_token() {
    try {
        var resp = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
            "headers": {
                "content-type": "application/json",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\""
            },
            "referrer": "https://bsky.app/",
            "body": "{\"identifier\":\"ahmedzaalan.bsky.social\",\"password\":\"Notanymore@1\",\"authFactorToken\":\"\",\"allowTakendown\":true}",
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        });
		//----------------

        var resp = await resp.json();

        return resp.accessJwt;
    }
    catch (error) {
        console.info('Error getting bluesky token:', error);
        return null;
    }
}

//var blueskyToken = '';

async function search_bluesky_user(search_keyword) {
    try {
        //if (!blueskyToken) {
        //    blueskyToken = await get_bluesky_token();
        //    console.info('blueskyToken:');
        //    console.info(blueskyToken);
        //}

        var resp = await fetch("https://mottlegill.us-west.host.bsky.network/xrpc/app.bsky.actor.searchActors?q=" + search_keyword, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "atproto-accept-labelers": "did:plc:ar7c4by46qjdydhdevvrndac;redact",
                "authorization": "Bearer eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NksifQ.eyJzY29wZSI6ImNvbS5hdHByb3RvLmFjY2VzcyIsInN1YiI6ImRpZDpwbGM6anZjZnZmb2VlaW80c3J1NnBtY3BrZWE0IiwiaWF0IjoxNzU0Njk2NDM2LCJleHAiOjE3NTQ3MDM2MzYsImF1ZCI6ImRpZDp3ZWI6bW90dGxlZ2lsbC51cy13ZXN0Lmhvc3QuYnNreS5uZXR3b3JrIn0.7SewSFmY5hyG7YDz9vfYczLlQkv16WDZKS5QDk2BX6sQyiejYWdOMeA4JWHbd0s7yzHkWNJRNX-9JcTF3HhKCw",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            "referrer": "https://bsky.app/",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
		//----------------

        var resp = await resp.json();

        //if (resp.error == "ExpiredToken") {
        //    blueskyToken = await get_bluesky_token();
        //    console.info('blueskyToken:');
        //    console.info(blueskyToken);
        //    return await search_bluesky_user(search_keyword);
        //}

        return resp.actors;

    }
    catch (error) {
        console.info('Error searching bluesky:', error);
        return [];
    }
}