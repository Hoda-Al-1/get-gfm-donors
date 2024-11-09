
console.info('start extention code');

if (window.opener && window.location.href.includes('https://www.linkedin.com/search/results/people')) {//search people page

	console.info('setting checkCountInterval');
	var checkCountInterval = setInterval(function () {
		var result = { cnt: 0, url: undefined };
		const els = document.querySelectorAll('h2.pb2.t-black--light.t-14');
		const noResult = document.querySelectorAll('.search-reusable-search-no-results').length > 0;
		const loaded = els.length > 0 || noResult;
		if (loaded) {
			clearInterval(checkCountInterval);
			console.info('checkCountInterval cleared');
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
				} else {
					result.cnt = 0;
				}
			}
		}

		if (loaded) {
			// Send back the response
			console.info('window.opener.postMessage');
			window.opener.postMessage({ type: 'responseData', data: result }, '*');
			//window.close();
		}
	}, 500);
}
else if (window.opener && window.location.href.includes('https://www.linkedin.com/in/')) {//profile page

	window.btnMoreClicked = false;
	window.btnConnectClicked = false;
	window.msgtextAreaFound = false;

	console.info('setting connectInterval');

	function clearAnlogInterval(intervalName, msg) {
		//console.info(window[intervalName]);
		clearInterval(window[intervalName]);
		console.info(`${msg}, ${intervalName} cleared`);
    }

	window.connectInterval = setInterval(function () {

		if (window.location.search?.includes("action=1") || window.location.href.includes('contact-info')) {
			
			document.querySelector('a#top-card-text-details-contact-info')?.click();

			var linkedInProfileArr = Array.from(document.querySelectorAll('svg.pv-contact-info__contact-icon')).filter(x => x.getAttribute("data-test-icon") == 'linkedin-bug-medium')
			if (linkedInProfileArr.length > 0) {
				var _email = Array.from(document.querySelectorAll('svg')).filter(x => x.getAttribute("data-test-icon") == "envelope-medium")[0]?.parentElement?.innerText?.replace("Email\n", '');
				//alert('email:' + _email);
				clearAnlogInterval('connectInterval', 'linkedInProfileArr');
				window.opener.postMessage({ type: 'emailCheckData', data: { email: _email } }, '*');
			}
			
			return;
		}

		var btnPending = Array.from(document.querySelectorAll('.artdeco-card button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view.pvs-profile-actions__action')).find(x => x.innerText == 'Pending');

		if (btnPending) {
			clearAnlogInterval('connectInterval', 'Pending');
			return;
		}

		var unfollowArr = Array.from(document.querySelectorAll('svg')).filter(x => x.getAttribute("data-test-icon") == "clear-medium");
		if (unfollowArr.length > 0) {
			clearAnlogInterval('connectInterval', 'unfollow found');
			return;
		}
	
		var sendBtn = document.querySelector('button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.ml1');
		var msgtextArea = document.querySelector('.connect-button-send-invite__custom-message-box .connect-button-send-invite__custom-message--block');
		if (sendBtn && !sendBtn.disabled && sendBtn.innerText == 'Send') {
			clearAnlogInterval('connectInterval', 'sendBtn clicked');
			sendBtn.click();
			return;
		}

		var btnAddNote = document.querySelector('.artdeco-modal__actionbar.ember-view.text-align-right .artdeco-button--secondary');
		if (btnAddNote && btnAddNote.innerText == 'Add a note') {
			btnAddNote.click();
			return;
		}

		if (!window.btnConnectClicked) {
			clickConnectBtn();
			return;
		}
		
		if (msgtextArea && msgtextArea.value == '' && !window.msgtextAreaFound) {

			window.msgtextAreaFound = true;
			// Request a random message from background.js
			//debugger
			console.info('chrome.runtime.sendMessage');
			console.info(chrome.runtime.sendMessage);
			chrome.runtime.sendMessage({ action: "getRandomMessage" }, (response) => {
				if (response && response.message) {
					msgtextArea.value = response.message;
					const event = new Event("input", { bubbles: true });
					msgtextArea.dispatchEvent(event);
				}
			});
		}

	}, 500);

	function clickConnectBtn() {

		var btnConnect = document.querySelector('button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.pvs-profile-actions__action');
		if (btnConnect && btnConnect.innerText == 'Connect') {
			window.btnConnectClicked = true;
			btnConnect.click();
			return;
		}

		var connectArr = Array.from(document.querySelectorAll('svg')).filter(x => x.getAttribute("data-test-icon") == "connect-medium");
		if (connectArr.length > 0) {
			var connectListItem = connectArr[0];
			if (connectListItem) {
				if (connectListItem.parentElement) {
					window.btnConnectClicked = true;
					connectListItem.parentElement.click();
					return;
				}
			}
		}

		var btnMore = document.querySelector('button.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.pvs-profile-actions__action.artdeco-button.artdeco-button--secondary.artdeco-button--muted.artdeco-button--2');
		if (btnMore && !window.btnMoreClicked) {
			btnMore.click();
			window.btnMoreClicked = true;
			return;
		}
	}
}