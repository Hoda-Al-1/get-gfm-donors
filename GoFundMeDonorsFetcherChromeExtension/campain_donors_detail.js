
campaignSlug.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if inside a form
        fetchDonors();
    }
});

btnFetchDonors.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    fetchDonors();
});

btnSearchLinkedin.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    searchLinkedin();
});

campaignSlug.addEventListener('focus', () => {
    // Select the text in the input field
    campaignSlug.select();
});