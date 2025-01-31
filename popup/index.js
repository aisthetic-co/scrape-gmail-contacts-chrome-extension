document.getElementById("scrape-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: scrapeContacts
        });
    });
});

// Function to scrape data and save as CSV
async function  scrapeContacts() {
    console.log(`Scrapping started`);

    let data = [];
    const uniqueEmails = []
    const totalEmails = Number(document.querySelector(".Dj > span:nth-child(2)").innerText.replace(",",""));
    const pageLimit = Number(document.querySelector(".Dj > span:nth-child(1) > span:nth-child(2)").innerText.replace(",",""));
    const pageCount = Math.ceil(totalEmails/pageLimit)
    let pageNo = 1

    while(pageNo <= pageCount){
        // Go to next page
        window.location.replace(`https://mail.google.com/mail/u/0/#inbox/p${pageNo}`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`Scrapping page ${pageNo}`);
        const pageElement = document.querySelectorAll(".yW span span")

        const pageContacts = [];
        pageElement.forEach((d, index) => {
            const name = d.getAttribute("name");
            const email = d.getAttribute("email");

            if(email && !uniqueEmails.includes(email)){
                uniqueEmails.push(email)
                pageContacts.push([name, email])
            }
        })

        data = data.concat(pageContacts)

        pageNo = pageNo + 1;
    }

    let csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email\n" + 
        data.map(e => e.join(",")).join("\n");

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scraped_data.csv");
    document.body.appendChild(link);
    link.click();

    console.log(`Exported total ${data.length} contacts`);
}