/*
File: stocks.js
Author: Mahjeed Marrow
Description: Stock portfolio application
Acknowledgments: Stock data from IEX
*/

/* -----------------------
BEGIN CONSTANT DEFINITIONS
-------------------------- */
//api data for the base call
const baseUrl   = "https://cloud.iexapis.com/beta/stock/"
const quoteTag  = "/quote" // for stock info
const apiKey    = "?token=pk_81a8960699ba496c991331070e7ce1f3"
//create element that allows for dynamic CSS updates
const sheet = document.createElement('style');
addCSS(sheet);
/* -----------------------
END CONSTANT DEFINITIONS
-------------------------- */
//localStorage.clear();
/* -----------------------
BEGIN DATA PERSISTENCE
HANDLING
-------------------------- */
document.onload = loadPersist()

/* is called when the page is refreshed.
preserves last state of page and loads
it onto reloaded page */
function loadPersist(){
  let retrievedListing = localStorage.getItem('persistedListing');
  postListing(retrievedListing);

  let retrievedHoldings = localStorage.getItem('persistedHoldings');
  postHolding(retrievedHoldings);

  let retrievedSum = localStorage.getItem('totalVal');
  if (retrievedSum === null){
    document.getElementById("headerSell").innerHTML = "Portfolio Value: $" + 0;
  }
  else{
    document.getElementById("headerSell").innerHTML = "Portfolio Value: $" + retrievedSum;
  }
}
//some useful variables
let newHTML = localStorage.getItem('persistedHoldings');
let portfolioValue = Number(localStorage.getItem('totalVal'));
let chunkArray = [];

/* -----------------------
BEGIN DATA PERSISTENCE
HANDLING
-------------------------- */

/* -----------------------
BEGIN OBJECT DEFINITIONS
-------------------------- */
/*
create listing object to instantiate
a successful search result */
function Listing(symbol, name, price){
  this.symbol = symbol;
  this.name   = name;
  this.price  = price;}
/*
create holding object to instantiate
a successful stock purchase */
function Holding(symbol, name, price, shares){
  this.symbol = symbol;
  this.name   = name;
  this.price  = price;
  this.shares = shares;
  let val = price * shares;
  this.value  = parseFloat(Math.round(val * 100) / 100).toFixed(2);}
/* -----------------------
END OBJECT DECLARATIONS
-------------------------- */

/* -----------------------
BEGIN STOCK SEARCH HANDLING
-------------------------- */
//create event handler for the API query
let element = document.querySelector('#search')
let searchHandler = element.addEventListener("search", getSearch);

//gets search input and makes call to API caller
function getSearch(userInput){
   let input = document.getElementById("search").value;
   let fullSearch = input.split(' ').join('+');
   apiCall(fullSearch);}

//makes the API call
function apiCall(search){
   //construct full API query
   let theQuery = baseUrl + search + quoteTag + apiKey;
   fetch(theQuery)
     .then(function(response) { return response.json();})
     .then(function(data){
       initListing(data);}
     )}
//creates an instance of a listing object
function initListing(stock){
  //set all of the object properties
  let symbol = stock["symbol"];
  let name   = stock["companyName"];
  let price  = stock["latestPrice"];

  //create listing instance
  let listing = new Listing(symbol,name,price);

  /* call function to create HTML
  representation of the listing */
  let chunk = listingHTML(listing);
  postListing(chunk);}
/* -----------------------
END STOCK SEARCH HANDLING
-------------------------- */

/* -----------------------
BEGIN MARKUP HANDLING
-------------------------- */
/* takes an instance of a listing
object and converts it to an
HTML representation of a listing.
This will be called if a user
searches for a stock */
function listingHTML(listing){
  //return new HTML markup
  let listHTML = `
  <div class="stockListing">
    <ul class="listingWrapper">
        <li class="listingItem">
          <button type="button" onclick="promptBuy()" id="buyBtn" class="btn btn-primary"><p id="buyText">Buy</p></button>
        </li>
        <li class="listingItem">
            <b><p class="listingText" id="stockSymbol">${listing.symbol}</p></b>
        </li>
        <li class="listingItem">
            <p class="listingText">${listing.name}</p>
        </li>
        <li class="listingItem">
            <p class="listingText">$${listing.price}/share</p>
        </li>
    </ul>
  </div>`
  localStorage.setItem('persistedListing',listHTML);
  return listHTML;
}

/* takes a chunk of HTML
representing a stock LISTING
and inserts it within markup */
function postListing(listOBJ){
  document.getElementById('entries').innerHTML = listOBJ;
}

/* takes a chunk of HTML
representing a stock HOLDING
and inserts it within markup */
function postHolding(holdingOBJ){
  let anchor = document.getElementById("entriesOwned");
  anchor.insertAdjacentHTML("afterend",holdingOBJ);
}

/* same as above but inserts
HTML in such a way that allows
for sorting in reverse order */
function postHoldingReverse(holdingOBJ){
  let anchor = document.getElementById("entriesOwned");
  anchor.insertAdjacentHTML("beforeend",holdingOBJ);
}

/* takes an instance of a holding
object and converts it to an
HTML representation of a holding
this will be called if a user
buys shares of a stock */
function holdingHTML(holding){
  //return new HTML markup
  let chunk = `
  <div class="stockHolding" id="${holding.symbol}Id">
    <ul class="holdingWrapper" id="${holding.symbol}Wrap">
        <li class="holdingItem ${holding.symbol}Item">
          <button type="button" onclick="let x = this.id;promptSell(x);"  id="${holding.symbol}" class="btn btn-warning sellBtn"><p>Sell</p></button>
        </li>
        <li class="holdingItem ${holding.symbol}Item holdingPrice">
            <p class="holdingText" id="${holding.symbol}Price">$${holding.value}</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingShares">
            <p class="holdingText" id="${holding.symbol}Shares">${holding.shares} shares</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingName">
            <p class="holdingText" id="${holding.symbol}Name">${holding.name}</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingSymbol">
            <b><p class="holdingText" id="${holding.symbol}Symbol">${holding.symbol}</p></b>
        </li>
    </ul>
  </div>`
  for (i in chunkArray){
    if (chunkArray[i].includes(holding.symbol)){
      delete chunkArray[i];
    }
  }
  chunkArray.push(chunk);

  for (j in chunkArray){
    newHTML += chunkArray[j];
  }

  localStorage.setItem('persistedHoldings',newHTML);
  return chunk;
}

/* a version of the holding html
function above that doesn't persist data.
Is called when a user sorts their holdings.
No reason to persist data that has already
been persisted. */
function holdingHTML2(holding){
  //return new HTML markup
  let chunk = `
  <div class="stockHolding" id="${holding.symbol}Id">
    <ul class="holdingWrapper" id="${holding.symbol}Wrap">
        <li class="holdingItem ${holding.symbol}Item">
          <button type="button" onclick="let x = this.id;promptSell(x);"  id="${holding.symbol}" class="btn btn-warning sellBtn"><p>Sell</p></button>
        </li>
        <li class="holdingItem ${holding.symbol}Item holdingPrice">
            <p class="holdingText" id="${holding.symbol}Price">$${holding.value}</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingShares">
            <p class="holdingText" id="${holding.symbol}Shares">${holding.shares} shares</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingName">
            <p class="holdingText" id="${holding.symbol}Name">${holding.name}</p>
        </li>

        <li class="holdingItem ${holding.symbol}Item holdingSymbol">
            <b><p class="holdingText" id="${holding.symbol}Symbol">${holding.symbol}</p></b>
        </li>
    </ul>
  </div>`
  return chunk;
}

/* adds CSS styling to HTML
elements created in this script */
function addCSS(sheet){
  sheet.innerHTML =
  `.stockHolding {border: 1px solid green;
                  border-radius: 10px;
                  min-height: 55px;
                  max-height: 55px;
                  max-width: 100%;
                  min-width: 100%;
                  margin-top: 10px;
                  }

   .holdingWrapper {list-style-type:none;}

   .holdingItem {float:right;
                 display: inline;
                 padding-right: 12px;
                 margin-top: 10px;}

   .holdingItem p {margin-top: 5px;}

   .sellBtn { margin-top: -2px;
              border:1px solid black;
              max-height: 40px;}

  #sellBtn p { margin-top: -5px;}

  .stockListing {border: 1px solid black;
                  border-radius: 10px;
                  min-height: 55px;
                  max-height: 55px;
                  max-width: 100%;
                  min-width: 100%;
                  float: left;}

   .listingWrapper {list-style-type:none;
                    margin-left:-30px;}

   .listingItem {float:left;
                 display: inline;
                 padding-right: 25px;
                 margin-top: 10px;}

   .listingItem p {margin-top: 5px;}

   #buyBtn { margin-top: -2px;
             border:1px solid black;
             max-height: 40px;}

  #buyBtn p { margin-top: 0px;}

   @media (max-width: 426px){

   .stockListing {border: 1px solid black;
                   border-radius: 10px;
                   min-height: 35px;
                   max-height: 35px;
                   max-width: 100%;
                   min-width: 100%;
                   float: left;}

   .stockHolding {border: 1px solid black;
                   border-radius: 10px;
                   min-height: 35px;
                   max-height: 35px;
                   max-width: 110%;
                   min-width: 110%;
                   margin-left:-18px;
                   float: left;}

       #buyBtn { margin-top: -12px;
                 border:1px solid black;
                 max-height: 30px;}

       .sellBtn { margin-top: -12px;
                  border:1px solid black;
                  max-height: 30px;}

    .listingItem p {margin-top: -2px;}

    .listingItem {float:left;
                  display: inline;
                  padding-right: 20px;
                  margin-top: 10px;}

    .holdingItem {float:right;
                  display: inline;
                  padding-left: -10px;
                  margin-top: 10px;}

    .holdingItem p {margin-top: -2px;}
    }


    @media (max-width: 375px){

    .stockListing {border: 1px solid black;
                    border-radius: 10px;
                    min-height: 35px;
                    max-height: 35px;
                    max-width: 112%;
                    min-width: 112%;
                    margin-left:-17px;
                    float: left;}

    .stockHolding {border: 1px solid black;
                    border-radius: 10px;
                    min-height: 35px;
                    max-height: 35px;
                    max-width: 112%;
                    min-width: 112%;
                    margin-left:-18px;
                    float: left;}

        #buyBtn { margin-top: -13px;
                  border:1px solid black;
                  max-height: 30px;
                  max-width: 50px;}

        .sellBtn { margin-top: -14px;
                   border:1px solid black;
                   max-height: 30px;
                   max-width: 50px;}

     .listingItem p {margin-top: -2px;}

     .listingItem {float:left;
                   display: inline;
                   padding-right: 20px;
                   margin-top: 10px;}

     .holdingItem {float:right;
                   display: inline;
                   padding-left: -15px;
                   margin-top: 10px;}

     .holdingItem p {margin-top: -2px;}
     }
   }
  `;
  document.body.appendChild(sheet);
}
/* -----------------------
END MARKUP HANDLING
-------------------------- */

/* -----------------------
BEGIN PORTFOLIO CONTENT HANDLING
-------------------------- */

/* Creates a holding object. Is called
when a user clicks a buy button and
enters a valid number of shares to
buy. */
function initHolding(stock,shares){
  let symbol = stock["symbol"];
  let name   = stock["companyName"];
  let price  = stock["latestPrice"];
  let holding = new Holding(symbol,name,price,shares);

  /* call function to create HTML
  representation of the listing */
  let holdChunk = holdingHTML(holding);
  postHolding(holdChunk);}

/* Is called when a user
clicks on a buy button. the function
reads user input and calls initHolding
function, which creates a complete
holding object for a stock */
function promptBuy(){
  //get input
  let shares = prompt("Please Enter Number of Shares You Would Like to Buy: ");

  //gets stock symbol
  let getSymbol  = document.getElementById("stockSymbol").textContent;

  /***
  CHECKS if the user has already purchased shares
  the stock they are attempting to buy. If they are,
  update the preexisting element representing the
  appropriate stock ***/
  let checker = document.getElementById(getSymbol+"Symbol");
  if (checker !== null){
    let currShares = document.getElementById(getSymbol+"Shares").textContent;
    let num = Number(currShares.match(/\d+/)[0]);
    let updatedShares = Number(shares) + num;

    //update share count in preexisting HTML element
    document.getElementById(getSymbol+"Shares").innerHTML = updatedShares+" shares";

    //make API call to get current price
    let stockQuery = baseUrl + getSymbol + quoteTag + apiKey;
    fetch(stockQuery)
      .then(function(response) { return response.json();
      })
      .then(function(data){

        //get latest price and update value in HTML
        let newPrice = data["latestPrice"];
        let newValue = updatedShares * newPrice;
        let roundedVal = parseFloat(Math.round(newValue * 100) / 100).toFixed(2);
        document.getElementById(getSymbol+"Price").innerHTML = "$"+roundedVal;

        //increment total portfolio value
        portfolioValue += Number(shares*newPrice);
        let updatedVal = `Portfolio Value: $${portfolioValue}`;
        document.getElementById("headerSell").innerHTML = updatedVal;
        localStorage.setItem("totalVal",portfolioValue);


        let stockName = document.getElementById(getSymbol+"Name").textContent;
        //update array of stocks
        updateArray(getSymbol,stockName,updatedShares,roundedVal);

        //let user know their buy was successful
        alert("Buy Successful!");
      })
    }
  else {
    let stockQuery = baseUrl + getSymbol + quoteTag + apiKey;

    //makes API call to constrct holding object
    fetch(stockQuery)
      .then(function(response) { return response.json();})
      .then(function(data){
        initHolding(data,shares)

        //update total value
        let newShares = Number(shares);
        let newPrice = data["latestPrice"];
        let newValue = newShares * newPrice;

        //do more rounding
        let roundedVal = parseFloat(Math.round(newValue * 100) / 100).toFixed(2);

        //increment portfolio and update HTML
        portfolioValue += Number(roundedVal);
        let updatedVal = `Portfolio Value: $${portfolioValue}`;
        document.getElementById("headerSell").innerHTML = updatedVal;
        localStorage.setItem("totalVal",portfolioValue);

        let stockName = document.getElementById(getSymbol+"Name").textContent;
        //update array of stocks
        updateArray(getSymbol,stockName,newShares,roundedVal);

        //let user know their buy was successful
        alert("Buy Successful!");
      })
    }
  }
/* Is called when a user
clicks on a sell button. the function
reads user input and subtracts
value from a stock holding,
if possible i.e., user owns
enough shares to make the
transaction. */
function promptSell(stock){
  let sellInput = prompt("Please Enter Number of Shares You Would Like to Sell: ");
  let totRetrieve = document.getElementById("headerSell").textContent.match(/\d+/)[0];

  //create string corresponding to ID name of stock
  let idConstructor = stock + "Shares";

  //get the current number of shares
  let idRetrieve = document.getElementById(idConstructor).textContent;
  let number = idRetrieve.match(/\d+/)[0];

  //updated share counts
  let difference = number - sellInput;

  //if the user has some shares remaining after selling
  if (difference > 0){
    //update shares count in HTML
    document.getElementById(idConstructor).innerHTML = difference + " Shares";

    let val = stock + "Price"
    let valRetrieve = document.getElementById(val).textContent.match(/\d+/)[0];
    let totRetrieve = document.getElementById("headerSell").textContent.match(/\d+/)[0];

    //calculate new value of holdings and update HTML
    let newVal = (valRetrieve/number)*difference;
    let rounded = parseFloat(Math.round(newVal * 100) / 100).toFixed(2)
    document.getElementById(val).innerHTML = "$"+rounded;

    //decrement total value, as well
    let decrementVal = (valRetrieve/number) * Number(sellInput);
    decrementTotal(Number(totRetrieve),decrementVal);

    let stockName = document.getElementById(stock+"Name").textContent;
    //update array of stocks
    updateArray(stock,stockName,difference,rounded);

    alert("Sell Successful!");

  //if the user has sold all of their holdings of a particular stock
} else if (difference === 0){
      //still need to decrement total value
      let s = document.getElementById(stock+"Id");
      let val = stock + "Price"
      let valRetrieve = document.getElementById(val).textContent.match(/\d+/)[0];
      let decrementVal = (valRetrieve/number) * Number(sellInput);
      decrementTotal(Number(totRetrieve),decrementVal);
      alert("Sell Successful!");

      let stockName = document.getElementById(stock+"Name").textContent;
      //update array of stocks
      updateArray(stock,stockName,0,0);

      //gotta remove it!
      removeStock(s);
  }
  //if the user tries to sell more shares than their own
  else {
    alert("Sorry, you cannot sell more shares than you own!");
  }
}
/* decreases total value of portfolio.
Is called whenever a user successfully
sells at least one share of any stock they
hold */
function decrementTotal(old,amount){
  let newSum = parseFloat(Math.round((old - amount) * 100) / 100).toFixed(2);
  document.getElementById("headerSell").innerHTML = "Portfolio Value: $" + newSum;
  localStorage.setItem("totalVal",newSum);
}
/* is called when a user
sells all of their shares for
a selected stock */
function removeStock(stock){
  stock.parentNode.removeChild(stock);
}

/* -----------------------
END PORTFOLIO CONTENT HANDLING
-------------------------- */

/* -----------------------
BEGIN SORT HANDLING
-------------------------- */
/* initialize array to contain
information about stocks */
let holdingArray    = [];

/* used to track state of the
sort. increments a state
variable each time a sort
is called. Determines whether
to sort in ascending or descending
order based on polarity of value */
let sortStateSym    = 0;
let sortStateShares = 0;
let sortStateVal    = 0;

//add event listeners for each button
document.getElementById("symbolSort").addEventListener("click", symbolSort);
document.getElementById("shareSort").addEventListener("click", shareSort);
document.getElementById("valSort").addEventListener("click", valSort);

//sorts numbers
function sortNumber(a,b) {
    return a - b;
}

/* is called when a user clicks the
button to sort holdings by symbol */
function symbolSort(){
  let symbolSorted = holdingArray.sort();
  console.log(symbolSorted);

  if(symbolSorted.length > 0){
    for(i in symbolSorted){

      if(symbolSorted[i][2] > 0){
        //clear preexisting HTML
        let sym   = symbolSorted[i][0];
        let ex    = document.getElementById(sym+"Id");
        removeStock(ex);

        let nom   = symbolSorted[i][1];
        let shrs  = symbolSorted[i][2];
        let pric  = Number(symbolSorted[i][3])/shrs
        let hold = new Holding(sym,nom,pric,shrs);
        let newHTM = holdingHTML2(hold);
        if (sortStateSym % 2 === 0){
          postHoldingReverse(newHTM);
        }
        else {
          postHolding(newHTM);}
      }
    }
  //increment sort state
  sortStateSym += 1;
}}

/* is called when the user
sorts by number of shares owned */
function shareSort(){
  let arrCopy = holdingArray;

  /*push share count to front of array to
  allow for easier sorting */
  for(i in arrCopy){
    arrCopy[i].unshift(Number(holdingArray[i][2]));
  }
  //sort array copy
  let sortedArr = arrCopy.sort(sortNumber);

  if(sortedArr.length > 0){
    for(i in sortedArr){

      if(sortedArr[i][0] > 0){
        //clear preexisting HTML
        let sym   = sortedArr[i][1];
        let ex    = document.getElementById(sym+"Id");
        removeStock(ex);

        let nom   = sortedArr[i][2];
        let shrs  = sortedArr[i][0];
        let pric  = Number(sortedArr[i][4])/shrs
        let hold = new Holding(sym,nom,pric,shrs);
        let newHT = holdingHTML2(hold);
        if (sortStateShares % 2 === 0){
          postHolding(newHT);
        }
        else {
          postHoldingReverse(newHT);}
        }
      }
  //increment sort state
  sortStateShares += 1;
  sortedArr = [];
  }
  //pop added items from the array
  for (j in holdingArray){
    holdingArray[j].shift();
  }
}

function valSort(){
  let arrCopy = holdingArray;

  /*push share count to front of array to
  allow for easier sorting */
  for(i in arrCopy){
    let dollarVal = Number(holdingArray[i][3]);
    arrCopy[i].unshift(dollarVal);
  }
  //sort array copy
  let sortedVal = arrCopy.sort(sortNumber);
  console.log(sortedVal)

  if(sortedVal.length > 0){
    for(i in sortedVal){

      if(sortedVal[i][0] > 0){
        //clear preexisting HTML
        let sym   = sortedVal[i][1];
        let ex    = document.getElementById(sym+"Id");
        removeStock(ex);

        let nom   = sortedVal[i][2];
        let shrs  = sortedVal[i][3];
        let pric  = Number(sortedVal[i][0])/shrs
        let hold = new Holding(sym,nom,pric,shrs);
        let newH = holdingHTML2(hold);
        if (sortStateVal % 2 === 0){
          postHolding(newH);
        }
        else {
          postHoldingReverse(newH);}
        }
      }
  //increment sort state
  sortStateVal += 1;
  sortedVal = [];
  }
  //pop added items from the array
  for (j in holdingArray){
    holdingArray[j].shift();
  }
  arrCopy = holdingArray;
}

function updateArray(symbol,name,shares,value){
  let entry = [symbol,name,shares,value];

  for (i in holdingArray){
    if(holdingArray[i][0] == symbol){
      delete holdingArray[i];
    }
  }
  holdingArray.unshift(entry);
}
/* -----------------------
END SORT HANDLING
-------------------------- */
