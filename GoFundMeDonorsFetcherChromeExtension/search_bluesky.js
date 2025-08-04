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

    var userFullNameLower = replaceNonEnglishChars(userFullName).toLocaleLowerCase();
    var filterdUsers = users.filter(x => replaceNonEnglishChars(x.displayName).toLocaleLowerCase() == userFullNameLower);
    if (filterdUsers.length == 1) {
        var user = filterdUsers[0];
        return user;
    }
    return null;
}

var blueskyToken = 'eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NksifQ.eyJzY29wZSI6ImNvbS5hdHByb3RvLmFjY2VzcyIsInN1YiI6ImRpZDpwbGM6anpnZWRyY3hpbXJsbWRuZjdha3pwZHN6IiwiaWF0IjoxNzU0MjY2OTc5LCJleHAiOjE3NTQyNzQxNzksImF1ZCI6ImRpZDp3ZWI6cGhvbGlvdGEudXMtd2VzdC5ob3N0LmJza3kubmV0d29yayJ9.eD89mbE3tExRoKh8h6XOFA7ouRtc5h5n-XmFN7HJg2C301LO5HYUxKEs_rO7ex2vXVgGoEEgBt71J8-lF9psaQ';

async function search_bluesky_user(search_keyword) {
    try {
        var resp = await fetch(`https://pholiota.us-west.host.bsky.network/xrpc/app.bsky.actor.searchActorsTypeahead?q=${search_keyword}&limit=8`, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "atproto-accept-labelers": "did:plc:ar7c4by46qjdydhdevvrndac;redact",
                "authorization": `Bearer ${blueskyToken}`,
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

        return resp.actors;

    }
    catch (error) {
        console.info('Error searching bluesky:', error);
        return [];
    }
}