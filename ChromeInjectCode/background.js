// background.js

function setCookie(name, value) {
	chrome.cookies.set({
		url: "https://www.linkedin.com",
		name: name,
		value: JSON.stringify(value),
		expirationDate: Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60), // 10 days
		domain: ".linkedin.com",
		path: "/"
	});
}

function getCookie(name, callback) {
	chrome.cookies.get({ url: "https://www.linkedin.com", name: name }, (cookie) => {
		if (cookie) {
			const decodedValue = decodeURIComponent(cookie.value);
			callback(JSON.parse(decodedValue));
		} else {
			callback([]);
		}
	});
}

function removeCookie(name) {
	chrome.cookies.remove({ url: "https://www.linkedin.com", name: name });
}

// Function to select a random message
function getRandomMessage(callback) {

	const messages =
		[
			"Hello, I'm reaching out to request your help in sharing my brother's story. His family is facing extreme hardship, and your support could make a difference. If you feel inclined, please consider connecting with me.",
			"Hi, I'm reaching out to ask if you could help spread my brother's story. His family is in a difficult situation, and your voice could provide valuable support. Please feel free to connect if you're interested.",
			"Hello, I would like to ask for your support in sharing my brother’s story. His family is struggling, and your voice could make a real difference. If you’re moved, please consider connecting with me.",
			"Hi there, I’m reaching out to ask if you can help amplify my brother’s story. His family is going through severe challenges, and your support could have an impact. Let me know if you’re open to connecting.",
			"Hello, I’m reaching out in hopes you might help share my brother’s story. His family is enduring significant hardships, and your support could be powerful. If you’d like, please connect with me.",
			"Hi, I’m reaching out to ask for your help in sharing my brother’s story. His family is going through tough times, and any support would mean a lot. Please consider connecting if you’re interested.",
			"Hi, I would love to connect with you and ask for your help in sharing my brother’s story. His family faces difficult challenges, and your voice could make a difference. Please reach out if you’re open to it.",
			"Hello, I’m contacting you to see if you might help share my brother’s story. His family is facing significant hardship, and any support would be deeply appreciated. Please consider connecting with me if you’re moved.",
			"Hi, I’m reaching out to request your help in bringing attention to my brother’s story. His family is experiencing great hardship, and your support could be invaluable. If you’re open, please connect with me.",
			"Hello, I’d like to ask for your help in sharing my brother’s story. His family faces serious challenges, and your voice could offer needed support. Please consider connecting if you’re interested.",
			"Hi, I’m reaching out to see if you might be willing to help share my brother’s story. His family is going through very hard times, and your support could make a difference. Please connect with me if you’re open to it.",
			"Hello, I am contacting you to seek your help in sharing my brother’s story. His family faces great hardships, and your voice could be very impactful. If you’re moved, please consider connecting with me.",
			"Hi, I would appreciate your support in sharing my brother’s story. His family is struggling, and your help could make a difference. Please connect with me if you’re open to it.",
			"Hello, I’m reaching out to ask for your support in helping share my brother’s story. His family faces severe challenges, and any support you could offer would be greatly appreciated. Please connect if you’re interested.",
			"Hi there, I would like to ask for your help in spreading my brother’s story. His family is going through tough times, and your voice could bring needed support. Please consider connecting with me.",
			"Hello, I’m contacting you to see if you could help share my brother’s story. His family is facing hardships, and any support would be appreciated. If you’re inclined, please connect with me.",
			"Hi, I’m reaching out in the hope that you might help share my brother’s story. His family is struggling, and your voice could be of great support. If you feel inclined, please consider connecting with me.",
			"Hello, I’m reaching out to seek your help in sharing my brother’s story. His family faces significant hardship, and any support would be deeply appreciated. Please consider connecting with me if you’re interested.",
			"Hi, I’d like to ask for your support in spreading my brother’s story. His family is dealing with severe hardship, and your voice could make a difference. Please reach out if you’re interested in connecting.",
			"Hello, I am reaching out to request your support in sharing my brother’s story. His family is in a difficult situation, and your voice could offer much-needed assistance. Please connect with me if you feel inclined."
		];

	getCookie("chosenIndexes", (chosenIndexes) => {
		console.info('chosenIndexes:');
		console.info(chosenIndexes);

		if (chosenIndexes.length >= messages.length) {
			removeCookie("chosenIndexes");
			chosenIndexes = [];
		}

		let randomIndex;
		do {
			randomIndex = Math.floor(Math.random() * messages.length);
		} while (chosenIndexes.includes(randomIndex));

		chosenIndexes.push(randomIndex);
		setCookie("chosenIndexes", chosenIndexes);

		// Return the chosen message via the callback
		callback(messages[randomIndex]);
	});
}

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.info('chrome.runtime.onMessage.addListener');
	if (request.action === "getRandomMessage") {
		getRandomMessage((message) => {
			sendResponse({ message: message });
		});
		return true; // Indicate asynchronous response
	}
});