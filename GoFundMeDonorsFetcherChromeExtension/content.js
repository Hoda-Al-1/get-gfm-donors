
console.info('start extention code');

const WAIT_TIME_OUT = 60000;

async function waitForElement(selector, timeout = WAIT_TIME_OUT, funcs) {
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
			'button.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.artdeco-button.artdeco-button--secondary.artdeco-button--muted.artdeco-button--2',//btnPending
			'button.artdeco-button.artdeco-button--2.artdeco-button--primary.ember-view',//btnConnect
			'button.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view.artdeco-button.artdeco-button--secondary.artdeco-button--muted.artdeco-button--2'//btnMore
		];

		var funcs = [
			() => Array.from(document.querySelectorAll('svg')).filter(x => x.getAttribute("data-test-icon") == "clear-medium").length > 0
		]
		var selector = selectorsArr.join(',');
		var _connections = 0;
		var _address = '';
		var arrResult = [];

		waitForElement(selector, WAIT_TIME_OUT, funcs).then((result) => {
			console.info(result.msg);
			console.info(result.data);
			arrResult = Array.from(document.querySelectorAll('.t-black--light')).filter(x => x.innerText?.includes('connections') || x.innerText?.includes('1 connection'));

			if (arrResult.length > 0) {
				_connections = parseInt(arrResult[0].innerText);
			}

			var addressEl = document.querySelector('span.text-body-small.inline.t-black--light.break-words');

			if (addressEl) {
				_address = addressEl.innerText;
			}


		}).catch((err) => console.info('Error:', err))
			.finally(() => {

				console.info('connections arrResult.length:' + arrResult.length);
				console.info('connections :' + _connections);

				if (_address) {
					_address = _address.trim();
				}

				console.info('address :' + _address);

				window.opener.postMessage({ type: 'connectionsCheckData', data: { connections: _connections, address: _address } }, '*');
			});

		console.info('other code action=chk_conn');
	}
	else if (window.location.href.includes('https://www.linkedin.com/search/results/people')) {//search people page

		// Get the query string from the current URL
		const queryString = window.location.search;
		// Create a URLSearchParams object from the query string
		const urlParams = new URLSearchParams(queryString);
		// Retrieve a specific parameter
		const index = parseInt(urlParams.get('i'));
		// Retrieve a specific parameter
		const keywords = urlParams.get('keywords');
		const keywords_lower = replaceNonEnglishChars(urlParams.get('keywords')).toLocaleLowerCase();

		const allow_ghost_image = urlParams.get('agi') == 1;

		const global_donors_cnt = parseInt(urlParams.get('gdc'));
		document.title = `Linkedin Checking donor ${index + 1} of ${global_donors_cnt}`;


		var searchResult = { index: index, name: keywords, cnt: 0, url: undefined, failureReason: undefined, is_ghost_image: undefined };

		console.info('waitForElement search people');
		var selectorsArr = [
			'h2.pb2.t-black--light.t-14',//result el
			'.search-reusable-search-no-results'//no result el
		];
		var selector = selectorsArr.join(',');
		waitForElement(selector, WAIT_TIME_OUT).then((result) => {
			console.info(result.msg);
			console.info(result.data);

			var el = document.querySelector('h2.pb2.t-black--light.t-14');
			if (el) {
				const innerText = el.innerText.trim();
				const cnt = parseInt(innerText.replaceAll('About', '').replaceAll('results', '').replaceAll(',', ''));

				console.info(cnt + ' results found for: ' + keywords);

				searchResult.cnt = cnt;
				var goodResult = false;
				if (cnt == 1) {
					console.info('original cnt:' + cnt);
					var nameSpan = document.querySelector('[data-view-name="search-entity-result-universal-template"] a[data-test-app-aware-link] span[aria-hidden="true"]');

					console.info('nameSpan:');
					console.info(nameSpan);

					if (nameSpan) {
						var foundName = replaceNonEnglishChars(nameSpan.innerText.toLocaleLowerCase());
						//alert(keywords);
						//alert(foundName);

						console.info('keywords_lower == foundName:');
						console.info(keywords_lower == foundName);

						if (keywords_lower == foundName) {
							var _url_el = document.querySelector('[data-view-name="search-entity-result-universal-template"] a[data-test-app-aware-link]');
							if (_url_el) {
								var _url = _url_el.href;
								_url = new URL(_url);
								console.info('!_url.pathname.includes("people")');
								console.info(!_url.pathname.includes("people"));
								if (!_url.pathname.includes("people")) {

									//var not_ghost_image = document.querySelectorAll('img.presence-entity__image.ivm-view-attr__img--centered.EntityPhoto-circle-3.EntityPhoto-circle-3.evi-image.lazy-image.ember-view').length > 0;
									var ghost_image = document.querySelectorAll('.EntityPhoto-circle-3-ghost-person.ivm-view-attr__ghost-entity').length > 0;


									searchResult.is_ghost_image = ghost_image;

									//console.info('not_ghost_image');
									//console.info(not_ghost_image);

									console.info('ghost_image');
									console.info(ghost_image);

									if (!ghost_image || allow_ghost_image) {
										// Return a new object with the cleaned URL
										_url = _url.origin + _url.pathname;
										searchResult.url = _url;
										goodResult = true;
										//var profileWindow = window.open(_url);
									} else {
										searchResult.failureReason = 'ghost_image';
									}
								} else {
									searchResult.failureReason = 'invalid_url';
								}
							} else {
								searchResult.failureReason = 'url_el_not_found';
							}
						} else {
							searchResult.failureReason = 'not_exact_name';
						}
					} else {
						searchResult.failureReason = 'nameSpan_not_found';
					}
				} else {
					searchResult.failureReason = 'count_is_not_one';
				}

				if (searchResult.cnt == 1 && !goodResult) {
					searchResult.cnt = -1;
				}
			} else {
				searchResult.failureReason = 'no_results';
				console.info('no results found');
			}
		})
			.catch((err) => console.info('Error:', err))
			.finally(() => {
				// Code to run always, regardless of success or failure
				// Send back the response
				console.info('window.opener.postMessage searchResult:');
				console.info(searchResult);
				window.opener.postMessage({ type: 'responseData', data: searchResult }, '*');
				//window.close();
			});

		console.info('other code search people');
	}
	else if (window.location.search?.includes("action=do_conn")) {//profile page

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
	else if (window.location.search?.includes("action=search_insta")) {
		var search_keyword = 'Ahmed Zaalani';
		var span_results = Array.from(document.querySelectorAll('span')).filter(x => x.innerText.toLocaleLowerCase() == search_keyword.toLocaleLowerCase());
		if (span_results.length == 1) {
			var span = span_results[0];
			const closestAnchor = span.closest('a'); // Find the closest <a> ancestor
			if (closestAnchor) {
				console.log(closestAnchor.getAttribute('href')); // Get the 'href' attribute
			}
		}
    }
}

function replaceNonEnglishChars(input) {
	// Create a mapping of non-English characters to their English equivalents
	const charMap = {
		'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a',
		'ç': 'c', 'č': 'c', 'ć': 'c',
		'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e',
		'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i',
		'ñ': 'n', 'ń': 'n',
		'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o', 'ō': 'o',
		'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
		'ý': 'y', 'ÿ': 'y',
		'š': 's', 'ś': 's',
		'ž': 'z', 'ź': 'z', 'ż': 'z',
		'æ': 'ae', 'œ': 'oe',
		'ß': 'ss'
	};

	// Convert the input string into an array of characters
	const chars = input.split('');

	// Replace each character using charMap if it exists
	const result = chars.map(char => charMap[char] || char).join('');

	return result;
}