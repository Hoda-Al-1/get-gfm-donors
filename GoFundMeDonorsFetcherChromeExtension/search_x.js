async function search_donors_in_x() {
    var x_result = [];
    for (var i = 0; i < global_donors.length; i++) {
        var username_result = await get_x_user(global_donors[i].name);
        if (username_result) {
            x_result.push({ global_index: i, name: username_result.name, url: username_result.url });
        }
        singleDonors = x_result;
    }
    return x_result
}

async function get_x_user(userFullName) {

    var users = await search_x_user(userFullName);

    if (users.length == 1) {

        var user = users[0];
        var userFullNameLower = replaceNonEnglishChars(userFullName).toLocaleLowerCase();
        return user;
    }
    return null;
}

async function search_x_user(search_keyword) {
    try {
        var resp = await fetch("https://x.com/i/api/graphql/oyfSj18lHmR7VGC8aM2wpA/SearchTimeline?variables=%7B%22rawQuery%22%3A%22" + search_keyword + "%22%2C%22count%22%3A20%2C%22querySource%22%3A%22typed_query%22%2C%22product%22%3A%22People%22%7D&features=%7B%22profile_label_improvements_pcf_label_in_post_enabled%22%3Afalse%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ar;q=0.8",
                "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-client-transaction-id": "7fdJCa9tjG3Pemh3MPjDHu0Ep2uYNefbeddguDCqEi9/wvbfTwBkOgWjNwjsGifDyeMy/e4i5A3mLGvne79R5NWpbdd67g",
                "x-csrf-token": "8a33c3f60d7a1f625a7d79126e28464baec0c05b9d1ac9dd513e6717fbacc39dac263e259870ee5705908e16b022879cc9b50f0a361a0fffdc7c767bc102f627bd758c8537bdc170cd5f0877af361b39",
                "x-twitter-active-user": "yes",
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": "en"
            },
            "referrer": "https://x.com/search?q=bassem%20yousef&src=typed_query&f=user",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        var resp = await resp.json();
        //

        return resp;

        //return resp.included.filter(x => x.$type == "com.x.voyager.dash.search.EntityResultViewModel")
        //    .map(x => {
        //        var _profile_image_url;
        //        try {
        //            _profile_image_url = x.image.attributes[0].detailData.nonEntityProfilePicture.vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
        //        } catch (error) {
        //            console.info('Error getting x image:', error);
        //        }
        //        return ({
        //            name: x.title.text, url: x.navigationUrl, secondarySubtitle: x.secondarySubtitle.text,
        //            profile_image_url: _profile_image_url
        //        });
        //    });

    }
    catch (error) {
        console.info('Error searching x:', error);
        return [];
    }
}

function getCookie(name) {
    const cookies = document.cookie.split("; "); // Split cookies by "; " into an array
    for (let i = 0; i < cookies.length; i++) {
        const [key, value] = cookies[i].split("="); // Split each cookie into [key, value]
        if (key === name) {
            return decodeURIComponent(value); // Return decoded value if key matches
        }
    }
    return null; // Return null if cookie not found
}