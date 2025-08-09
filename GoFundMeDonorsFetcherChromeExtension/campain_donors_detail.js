
campaignSlug.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if inside a form
        await fetchDonors();
    }
});

btnFetchDonors.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    await fetchDonors();
});

btnSearchLinkedin.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
    await startSearch();
});

campaignSlug.addEventListener('focus', () => {
    // Select the text in the input field
    campaignSlug.select();
});