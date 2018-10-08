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
    }).catch(function(){
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
const addButton = function () {

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
    const queryURL = `https://api.iextrading.com/1.0/stock/${stock}/batch?types=quote,logo,news&last=10`;

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

        //Create a div tag
        const stockDiv = $(`<div>`).addClass("company-info");

        //Display the company name
        const company = $(`<h3>${companyName}<img src=${logoUrl} class="img-fluid ml-5 mt-5 mb-5" id="company-logo">
        </h3>`);

        //Appengin the company information to <div>
        stockDiv.append(company);


        //Creating <table>
        const table = $(`<table class="table table-bordered">`);

        //Creating a <thead>
        const thead = $(`<thead>
                <tr>
                    <th width = "30%">Price</th>
                    <th width = "70%">News</th>
                </tr>
            </thead>`);
        
        //Creating a <tbody>
        const tbody = $(`<tbody>`);
        
        //Creating <tr>
        const tr = $(`<tr>`);

        //Creating <td> containing a price value
        const tdPrice = $(`<td valign="top">${price}</td>`);

        //Creating <td> to input the news
        let newsTd = $(`<td>`);

        //Creating data inside <td>
        news.forEach(function(e){
            const headLine = e.headline;
            const summary = e.summary;
            const newsUrl = e.url;
            const newsSource = e.source;
            newsTd.append(`<h5>${headLine}</h5> <br>`); 
            newsTd.append(`<p>${summary}</p>`);
            newsTd.append(`<p>Source: ${newsSource}</p>`);

            const url = $(`<a target="_blank">Read more</a>`).attr("href", newsUrl);
            newsTd.append(url);
            newsTd.append(`<hr>`)
        });

        //Appending the <td> content to <tr>
        tr.append(tdPrice);
        tr.append(newsTd);

        //<tbody> is appending <tr>
        tbody.append(tr);

        //<div> is appending <table>
        stockDiv.append(table);

        //<thead> is appending after <table>
        stockDiv.append(thead);

        //<tbody> was appended after <table>
        stockDiv.append(tbody);

        //<div> was appeded to jumbotron
        //Append to the jumbotron
        $(".jumbotron").prepend(stockDiv);

        //Change the jumbotoron's background color from white to gray.
        $(".jumbotron").removeClass("bg-white");
        $(".jumbotron").addClass("bg-gray");


    }).catch(function(){
        alert("Could not retrieve the information. Please try again later.");
    });


}

const clearButton = function(){
    $(".jumbotron").empty();
}

//When Add a stock button was clicked, adds a stock symbol button when clicked
$("#stockButton").click(addButton);

//When the stock symbol button was clicked, the information displays
$("#renderButton").on("click", ".stock", renderStock);

$("#clearButton").click(clearButton);

//Calling collectList to create a list of all stock symbols(validationList)
collectList();

//Calling render for the initial display
renderButton();
