let stocksList = ["TM", "HMC", "DAL", "F"];
const validationList = [];
let favoriteList = [];

// Function for displaying stock data
const renderButton = function () {
  // Deletes the stocks prior to adding new stocks
  // (this is necessary otherwise you will have repeat buttons)
  $("#renderButton").empty();
  // Loops through the array of stocks
  stocksList.forEach(function (e) {
    // Then dynamicaly generates buttons for each stock in the array
    // This code $("<button>") is all jQuery needs to create the beginning and end tag. (<button></button>)
    let newButton = $("<button>");
    // Adds a class of stock to our button
    newButton.addClass("stock btn btn-outline-success mr-3 mt-3");
    // Added a data-attribute
    newButton.attr("data-name", e);
    // Provided the initial button text
    newButton.text(e);
    // Added the button to the buttons-view div
    $("#renderButton").append(newButton);
  });
};

//Creates the list of all stock symbols
const collectList = function () {
  const apiKey = config.MY_API_TOKEN;
  const queryURL = `https://cloud.iexapis.com/stable/ref-data/iex/symbols?token=${apiKey}`;

  $.ajax({
    url: queryURL,
    method: "GET",
  })
    .then(function (response) {
      response.forEach(function (e) {
        validationList.push(e.symbol);
      });
    })
    .catch(function () {
      alert("Could not retrieve the information. Please try again later.");
    });
};

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
};

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
};

//Add stock symbol button
const addButton = function (event) {
  //Prevent reset
  event.preventDefault();

  //Get and store the stock symbol input value
  const stockName = $("#stockSymbol").val().trim().toUpperCase();

  //Check if the stock symbol has a value
  if (stockName.length === 0) {
    alert("Please type the stock symbol");
  } else if (checkValidation(stockName)) {
    alert("The stock symbol does not exist. Please try again");
    $("#stockSymbol").val("");
  } else if (checkButton(stockName)) {
    alert(
      `The button ${stockName} already exists. Please type another stock symbol.`
    );
    $("#stockSymbol").val("");
  } else {
    //Add the stock symbol to the stockList
    stocksList.push(stockName);

    $("#stockSymbol").val("");
    renderButton();
  }
};

//Create a favorite button
const renderFavorite = function () {
  const symbol = $(".checkbox").val();

  favoriteList.push(symbol);
};

//Create row and column to display the company information

const createCompanyInfo = function (response) {
  const logoUrl = response.logo.url;
  const companyName = response.quote.companyName;
  const ceo = response.company.CEO;
  const industry = response.company.industry;
  const symbol = response.quote.symbol;

  //Create a row
  const row = $("<div>").addClass("row");

  //create a left column in Jumbotron
  const column = $("<div>").addClass("col-12 col-md-7 mt-3");

  //Create a right column in Jumbotron
  const column2 = $("<div>").addClass("col-11 col-md-4");

  const column3 = $("<div>").addClass("col-12 col-md-1 mt-5 pr-5");

  //<div> for the first row in the jumbotron
  const stockCompany = $("<div>").addClass("company-name");

  //Display the company name
  const company = $("<h3>").text(companyName);

  //Display the CEO
  const ceoName = $("<h5>").text(`CEO: ${ceo}`);

  //Display industry
  const indName = $("<h5>").text(`Industry: ${industry}`);

  //Display the company logo
  const img = $("<img>").addClass("img-fluid mr-3 mt-3 mb-5");
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

  const favoriteButton = $("<input>")
    .addClass("checkbox")
    .attr("type", "checkbox");
  favoriteButton.attr("value", symbol);
  favoriteButton.attr("onclick", `renderFavorite()`);

  const favorite = $("<h7>").text("Favorite");
  favorite.append("<br>");

  column3.append(favorite);
  column3.append(favoriteButton);

  //Appen to the first row
  row.append(column);
  row.append(column2);
  row.append(column3);

  //Return a row cotaining two columns
  return row;
};

//Get more news from Newsapi.org
const getMoreNews = function (companyName, cb) {
  const apiKey = config.NEWSAPI_TOKEN;
  const apiUrl = `https://newsapi.org/v2/everything?q=${companyName}&apiKey=${apiKey}&pageSize=3`;

  $.ajax({
    url: apiUrl,
    method: "GET",
  }).then(function (response) {
    const news = response;

    //Creating data inside <td> for news
    news.forEach(function (e) {
      //Get the news information from ajax response
      const headLine = e.title;
      const summary = e.description;
      const newsUrl = e.url;
      const newsSource = e.source.name;

      //Add all inforamtion for <td>
      let anotherTd = $("<p>");
      const headLineTag = $("<h5>").text(headLine);
      summaryTag = $("<p>").text(summary);
      sourceTag = $("<p>").text(`Source: ${newsSource}`);
      anotherTd.append(headLineTag);
      anotherTd.append(summaryTag);
      anotherTd.append(sourceTag);

      //Create <a> tag to read more for this story and open a new window.
      const url = $("<a>").attr("target", "_blank");
      url.text("Read more").attr("href", newsUrl);

      //Add the url to <td>
      anotherTd.append(url);

      //Make a line to seperate from another story
      anotherTd.append(`<hr>`);

      cb(anotherTd);
    });
  });
};

//Create a <tbody>
const createTbody = function (thead, table, price, news, name) {
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
    const url = $("<a>").attr("target", "_blank");
    url.text("Read more").attr("href", newsUrl);

    //Add the url to <td>
    newsTd.append(url);

    //Make a line to seperate from another story
    newsTd.append(`<hr>`);
  });

  //Appending the <td> content to <tr>
  tr.append(tdPrice);

  //For another set of news from newsapi.org
  let td2;

  //Call the funcgtion to get the information
  getMoreNews(name, function (td2) {
    newsTd.append(td2);
  });

  // tr.append td for news;
  tr.append(newsTd);

  //<tbody> is appending <tr>
  tbody.append(tr);

  //<thead> is appending after <table>
  table.append(thead);

  //<tbody> was appended after <table>
  table.append(tbody);

  return table;
};

//Display the stock information on Jumbotron screen
const renderStock = function () {
  const stock = $(this).attr("data-name");
  const apiKey = config.MY_API_TOKEN;
  const queryURL = `https://cloud.iexapis.com/v1/stock/${stock}/batch?types=quote,news,chart,logo,company&range=1m&last=10&token=${apiKey}`;

  // Creates AJAX call for the specific stock button being clicked
  $.ajax({
    url: queryURL,
    method: "GET",
  })
    .then(function (response) {
      const price = response.quote.latestPrice;
      const news = response.news;

      //Create a div tag
      const stockDiv = $("<div>").addClass("company-info");

      //Create row and column for the company information
      const rowTag = createCompanyInfo(response);

      //Append to the stockDiv
      stockDiv.append(rowTag);

      //Creating <table>
      const table = $("<table>").addClass("table table-borderless");

      //Creating a <thead> and <tr> for Price and News
      const thead = $(`<thead>
                <tr>
                    <th width = "30%">Price</th>
                    <th width = "70%">News</th>
                </tr>
            </thead>`);

      //Create <tbody> and append <thead> and <tbody>
      const table1 = createTbody(
        thead,
        table,
        price,
        news,
        response.quote.companyName
      );

      //<div> is appending <table>
      stockDiv.append(table1);

      //<div> was appeded to jumbotron
      //Append to the jumbotron
      $(".jumbotron").prepend(stockDiv);

      //Change the jumbotoron's background color from white to gray.
      $(".jumbotron").removeClass("bg-white");
      $(".jumbotron").addClass("bg-gray");
    })
    .catch(function () {
      //If the site is down, it goes here.
      alert("Could not retrieve the information. Please try again later.");
    });
};

//Clear the button
const clearButton = function (e) {
  //Avoid reset
  e.preventDefault();

  //Clear jumbotron screen
  $(".jumbotron").empty();
  $(".jumbotron").removeClass("bg-gray");
  $(".jumbotron").addClass("bg-white");

  //Clear stock button
  stocksList = ["TM", "HMC", "DAL", "F"];

  //Add favorite list to the default stock button
  for (let i = 0; i < favoriteList.length; i++) {
    if (!stocksList.includes(favoriteList[i])) {
      stocksList.push(favoriteList[i]);
    }
  }

  //Clear favorite button
  favoriteList = [];

  //Display the stock button
  renderButton();
};

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
