
console.info('start extention code');

async function waitForElement(selector, timeout = 5000, funcs) {
	return new Promise((resolve, reject) => {
		const observer = new MutationObserver((mutationsList, observer) => {
			const element = document.querySelector(selector);
			if (element) {
				observer.disconnect();
				resolve({ data: element, msg: 'Element ' });
			}
			else if (funcs) {
				for (var i = 0; i < funcs.length; i++) {
					if (funcs[i]()) {
						observer.disconnect();
						resolve({ data: funcs[i], msg: 'Fucntion ' });
						break;
                    }
                }
            }
		});

		observer.observe(document.body, { childList: true, subtree: true });

		setTimeout(() => {
			observer.disconnect();
			reject(new Error("Element did not appear within the timeout"));
		}, timeout);
	});
}

if (!window.hasMessageListener) {
	window.hasMessageListener = true;
	window.addEventListener('message', (event) => {
		if (event.type == 'FROM_PAGE') {
			console.info('message recived from FROM_PAGE:');
			return;
        }
		var singleDonors = event.data.data;
		console.info('message recived from opener, event:');
		//alert('message recived from opener, event:');
		console.info(event);
		chrome.runtime.sendMessage({ action: "updateSingleDonors", data: singleDonors }, (response) => {

			console.info('response from updateSingleDonors:');
			console.info(response);
			if (response && response.message) {
				console.info('response.message:');
				console.info(response.message);
			}
		});
	});
}

if (window.opener) {
	if (window.location.search?.includes("action=chk_conn")) {
		console.info('waitForElement action=chk_conn');
		var selectorsArr = [
			'.artdeco-card button.artdeco-button.artdeco-button--2.artdeco-button--secondary.ember-view.pvs-profile-actions__action',//btnPending
			'button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.pvs-profile-actions__action',//btnConnect
			'button.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.pvs-profile-actions__action.artdeco-button.artdeco-button--secondary.artdeco-button--muted.artdeco-button--2'//btnMore
		];

		var funcs = [
			() => Array.from(document.querySelectorAll('svg')).filter(x => x.getAttribute("data-test-icon") == "clear-medium").length > 0
		]
		var selector = selectorsArr.join(',');

		waitForElement(selector, 20000, funcs).then((result) => {
			console.info(result.msg);
			console.info(result.data);
			var arrResult = Array.from(document.querySelectorAll('.t-black--light')).filter(x => x.innerText.includes('connections'));
			var _connections = 0;

			if (arrResult.length > 0) {
				_connections = parseInt(arrResult[0].innerText);
			}

			console.info('connections arrResult.length:' + arrResult.length + ", window['connectInterval']:" + window['connectInterval']);
			console.info('connections :' + _connections);
			window.opener.postMessage({ type: 'connectionsCheckData', data: { connections: _connections } }, '*');

		}).catch((err) => console.info('Error:', err.message));

		console.info('other code action=chk_conn');
	}
	else if (window.location.href.includes('https://www.linkedin.com/search/results/people')) {//search people page

		console.info('waitForElement search people');
		var selectorsArr = [
			'h2.pb2.t-black--light.t-14',//result el
			'.search-reusable-search-no-results'//no result el
		];
		var selector = selectorsArr.join(',');

		waitForElement(selector, 20000).then((result) => {
			console.info(result.msg);
			console.info(result.data);

			var searchResult = { cnt: 0, url: undefined };

			var el = document.querySelector('h2.pb2.t-black--light.t-14');
			if (el) {
				console.info('results found');
				const innerText = el.innerText.trim();
				const cnt = parseInt(innerText.replaceAll('About', '').replaceAll('results', '').replaceAll(',', ''));

				console.info(cnt);

				searchResult.cnt = cnt;
				var goodResult = false;
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
								var not_ghost_image = document.querySelectorAll('img.presence-entity__image.ivm-view-attr__img--centered.EntityPhoto-circle-3.EntityPhoto-circle-3.evi-image.lazy-image.ember-view').length > 0;
								if (not_ghost_image) {
									// Return a new object with the cleaned URL
									_url = _url.origin + _url.pathname;
									searchResult.url = _url;
									goodResult = true;
									//var profileWindow = window.open(_url);
								}
							}
						}
					}
				}

				if (!goodResult) {
					searchResult.cnt = 0;
				}
			} else {
				console.info('no results found');
            }
			// Send back the response
			console.info('window.opener.postMessage');
			window.opener.postMessage({ type: 'responseData', data: searchResult }, '*');
			//window.close();

		}).catch((err) => console.info('Error:', err.message));

		console.info('other code search people');
	}
	else if (window.location.href.includes('https://www.linkedin.com/in/')) {//profile page

		window.btnMoreClicked = false;
		window.btnConnectClicked = false;
		window.msgtextAreaFound = false;

		console.info('setting connectInterval');

		function clearAnlogInterval(intervalName, msg) {
			//console.info(window[intervalName]);
			clearInterval(window[intervalName]);
			window[intervalName] = undefined;
			console.info(`${msg}, ${intervalName} cleared , window[${intervalName}]: ${window[intervalName]}`);
		}

		function stopIntervalWhenBtnFound() {

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

			var btnConnect = document.querySelector('button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view.pvs-profile-actions__action');
			if (btnConnect && btnConnect.innerText == 'Connect') {
				clearAnlogInterval('connectInterval', 'btnConnect found');
				return;
			}

			var btnMore = document.querySelector('button.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.pvs-profile-actions__action.artdeco-button.artdeco-button--secondary.artdeco-button--muted.artdeco-button--2');
			if (btnMore) {
				clearAnlogInterval('connectInterval', 'btnConnect found');
				return;
			}
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
}