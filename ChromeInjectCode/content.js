var myInterval = setInterval(function () {
	var result = { cnt: 0, url: undefined };
	const els = document.querySelectorAll('h2.pb2.t-black--light.t-14');
	const noResult = document.querySelectorAll('.search-reusable-search-no-results').length > 0;
	const loaded = els.length > 0 || noResult;
	if (loaded) {
		clearInterval(myInterval);
	}
	if (els.length > 0) {
		const innerText = els.item(0).innerText.trim();
		const cnt = parseInt(innerText.replaceAll('About', '').replaceAll('results', '').replaceAll(',', ''));
		result.cnt = cnt;
		if (cnt == 1) {
			var nameSpan = document.querySelector('[data-view-name="search-entity-result-universal-template"] a.app-aware-link span[aria-hidden="true"]');
			if (nameSpan) {
				var foundName = nameSpan.innerText.toLocaleLowerCase();
				// Get the query string from the current URL
				const queryString = window.location.search;
				// Create a URLSearchParams object from the query string
				const urlParams = new URLSearchParams(queryString);
				// Retrieve a specific parameter
				const keywords = urlParams.get('keywords').toLocaleLowerCase();

				//alert(keywords);
				//alert(foundName);

				if (keywords == foundName) {
					var _url = document.querySelector('[data-view-name="search-entity-result-universal-template"] a.app-aware-link').href;
					_url = new URL(_url);
					if (!_url.pathname.includes("people")) {
						// Return a new object with the cleaned URL
						_url = _url.origin + _url.pathname;
						result.url = _url;
					} else {
						result.cnt = 0;
                    }
				} else {
					result.cnt = 0;
				}
			}
		}
	}

	if (loaded) {
		// Send back the response
		window.opener.postMessage({ type: 'responseData', data: result }, '*');
		//window.close();
	}
}, 500);