const stocksList = ["TM", "HMC", "DAL", "F"];
const validationList = [];


// Function for displaying stock data
const renderButton = function () {

    // Deletes the stocks prior to adding new stocks
    // (this is necessary otherwise you will have repeat buttons)
    $('#renderButton').empty();
    // Loops through the array of stocks
    for (let i = 0; i < stocksList.length; i++) {

        // Then dynamicaly generates buttons for each stock in the array
        // This code $("<button>") is all jQuery needs to create the beginning and end tag. (<button></button>)
        let newButton = $("<button>");
        // Adds a class of stock to our button
        newButton.addClass("stock btn btn-outline-success mr-3 mt-3");
        // Added a data-attribute
        newButton.attr("data-name", stocksList[i]);
        // Provided the initial button text
        newButton.text(stocksList[i]);
        // Added the button to the buttons-view div
        $('#renderButton').append(newButton);
    }
}

//Creates the list of all stock symbols
const collectList = function () {

    const queryURL = `https://api.iextrading.com/1.0/ref-data/symbols`;

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function (response) {

        response.forEach(function (e) {
            validationList.push(e.symbol);
        });
    }).catch(function () {
        alert("Could not retrieve the information. Please try again later.")
    });

}

//Check if the button was already created or not.
const checkButton = function (stock) {

    //The fucntion returns false if there is no matched stock symbols
    //returns true there is a match
    let validationFlag = false;

    for (i = 0; i < stocksList.length; i++) {
        if (stock === stocksList[i]) {
            validationFlag = true;
        }
    }

    return validationFlag;

}


//Check if the stock symbol is in the list or not
const checkValidation = function (stock) {

    //The fucntion returns true if there is no matched stock symbols
    //returns false there is a match
    let validationFlag = true;

    for (i = 0; i < validationList.length; i++) {
        if (stock === validationList[i]) {
            validationFlag = false;
        }
    }

    return validationFlag;

}


//Add stock symbol button 
const addButton = function (event) {

    //Prevent reset
    event.preventDefault();

    //Get and store the stock symbol input value
    const stockName = $("#stockSymbol").val().trim().toUpperCase();

    //Check if the stock symbol has a value
    if (stockName.length === 0) {
        alert("Please type the stock symbol");
    }
    else if (checkValidation(stockName)) {
        alert("The stock symbol does not exist. Please try again");
        $("#stockSymbol").val("");
    }
    else if (checkButton(stockName)) {
        alert(`The button ${stockName} already exists. Please type another stock symbol.`);
        $("#stockSymbol").val("");
    }
    else {
        //Add the stock symbol to the stockList
        stocksList.push(stockName);

        $("#stockSymbol").val("");
        renderButton();
    }
}

const renderStock = function () {

    const stock = $(this).attr("data-name");
    const queryURL = `https://api.iextrading.com/1.0/stock/${stock}/batch?types=quote,logo,news,company&last=10`;

    // Creates AJAX call for the specific stock button being clicked
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function (response) {

        console.log(response);
        const logoUrl = response.logo.url;
        const companyName = response.quote.companyName;
        const price = response.quote.latestPrice;
        const news = response.news;
        const ceo = response.company.CEO;
        const industry = response.company.industry;

        //Create a row
        const row = $("<div>").addClass("row");

        //create a left column in Jumbotron
        const column = $("<div>").addClass("col-12 col-md-7 mt-3");

        //Create a right column in Jumbotron
        const column2 = $("<div>").addClass("col-12 col-md-5");

        //Create a div tag
        const stockDiv = $("<div>").addClass("company-info");

        //<div> for the first row in the jumbotron
        const stockCompany = $("<div>").addClass("company-name");

        //Display the company name
        const company = $("<h3>").text(companyName);

        //Display the CEO
        const ceoName = $("<h5>").text(`CEO: ${ceo}`);

        //Display industry
        const indName = $("<h5>").text(`Industry: ${industry}`);

        //Display the company logo
        const img = $("<img>").addClass("img-fluid ml-5 mt-3 mb-5");
        img.attr("id", "company-logo");
        img.attr("src", logoUrl);
        //Append to the right column in Jumbotron
        column2.append(img);

        //Appengin the company information to <div>
        stockCompany.append(company);
        stockCompany.append(ceoName);
        stockCompany.append(indName);

        //Append the company information to the left column of first row in Jumbotoron
        column.append(stockCompany);

        //Appen to the first row
        row.append(column);
        row.append(column2);

        //Append to the stockDiv
        stockDiv.append(row);


        //Creating <table>
        const table = $("<table>").addClass("table table-borderless");

        //Creating a <thead> and <tr> for Price and News
        const thead = $(`<thead>
                <tr>
                    <th width = "30%">Price</th>
                    <th width = "70%">News</th>
                </tr>
            </thead>`);

        //Creating a <tbody>
        const tbody = $("<tbody>");

        //Creating <tr>
        const tr = $("<tr>");

        //Creating <td> containing a price value
        const tdPrice = $("<td>").attr("valign", "top");
        tdPrice.text(price);

        //Creating <td> to input the news
        let newsTd = $("<td>");

        //Creating data inside <td> for news
        news.forEach(function (e) {

            //Get the news information from ajax response
            const headLine = e.headline;
            const summary = e.summary;
            const newsUrl = e.url;
            const newsSource = e.source;

            //Add all inforamtion to <td>
            headLineTag = $("<h5>").text(headLine);
            summaryTag = $("<p>").text(summary);
            sourceTag = $("<p>").text(`Source: ${newsSource}`);
            newsTd.append(headLineTag);
            newsTd.append(summaryTag);
            newsTd.append(sourceTag);

            //Create <a> tag to read more for this story and open a new window.
            const url = $("<a>").attr("target", "_blank")
            url.text("Read more").attr("href", newsUrl);

            //Add the url to <td>
            newsTd.append(url);

            //Make a line to seperate from another story
            newsTd.append(`<hr>`);
        });

        //Appending the <td> content to <tr>
        tr.append(tdPrice);
        tr.append(newsTd);

        //<tbody> is appending <tr>
        tbody.append(tr);

        //<thead> is appending after <table>
        table.append(thead);

        //<tbody> was appended after <table>
        table.append(tbody);


        //<div> is appending <table>
        stockDiv.append(table);

        //<div> was appeded to jumbotron
        //Append to the jumbotron
        $(".jumbotron").prepend(stockDiv);

        //Change the jumbotoron's background color from white to gray.
        $(".jumbotron").removeClass("bg-white");
        $(".jumbotron").addClass("bg-gray");


    }).catch(function () { //If the site is down, it goes here.
        alert("Could not retrieve the information. Please try again later.");
    });


}

//Clear the button
const clearButton = function () {
    $(".jumbotron").empty();
}

//When Add a stock button was clicked, adds a stock symbol button when clicked
$("#stockButton").click(addButton);

//When the stock symbol button was clicked, the information displays
$("#renderButton").on("click", ".stock", renderStock);

//Call back the function when the clear button is clicked
$("#clearButton").click(clearButton);

//Calling collectList to create a list of all stock symbols(validationList)
collectList();

//Calling render for the initial display
renderButton();
