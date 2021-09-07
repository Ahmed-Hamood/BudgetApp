//..................................................................
// budget Controller
//..................................................................

let budgetDataController = (function() {

  let data = {
      allItems: {
        exp: [],   // {id: 1, description: "fvd", value: 43}
        inc: []   // {id: 3, description: "cb", value: 600, percentage: -1}
      },
      totals: {
        exp: 0,
        inc: 0
      } ,
      budget : 10 ,
      percentage : -1
    };


  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };


  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1 ;
  };

  Expense.prototype.calculateItemPercentage = function(totalIncome){
          if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);  
          }else{
            this.percentage = -1 ;
          }
  };

  Expense.prototype.getPercentage = function(){
      return this.percentage;
  };

  


    // assign totals[type] total values of the value
  let calculateTotal = function(type){
      let sum = 0;
      data.allItems[type].forEach(function(current){
           sum += current.value;
      });
      data.totals[type] = sum ;
     
  } 



  return {

      addItem: function(type, des, val) {
        let newItem, ID, typeLength;
        typeLength = data.allItems[type].length;
        // Income {id: 2, description: "cat", value: "44"}
        ID = 0 < typeLength ? data.allItems[type][typeLength - 1].id + 1 : 1;
        // create new item  Exp or inc
        if (type === "exp") {
          newItem = new Expense(ID, des, val);
        } else if (type === "inc") {
          newItem = new Income(ID, des, val);
        }

        // push it into data structure
        data.allItems[type].push(newItem);
          console.log(newItem);
        // return the new element
        return newItem; // {id: 1, description: "fvd", value: 43}
      } 


      ,

       // calculate remaining amount  totalincome - total expenses 
      calculateBudget : function() {
        // calculte total income and expense++
        calculateTotal('exp');
        calculateTotal('inc');

        // calculate the budget : income - expense
        data.budget = data.totals.inc - data.totals.exp ;   // save amount 

        // calculate the percentage of income that we spend
        if(data.totals.inc > 0 ){
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
        }else{
          data.percentage = -1 ;
        }
        
      }
      
      ,


        calculatePercentages : function() { // calculate items exp percentage

          data.allItems.exp.forEach(function(current){
              current.calculateItemPercentage(data.totals.inc);
          });


        }


       ,

       getPercentages : function(){

         let allperc = data.allItems.exp.map(function(item){
          return item.getPercentage();
         });

         return allperc;

       }


       ,


      getDataBudget : function(){
        return {
          totalBudget : data.budget ,
          totalIncome : data.totals.inc,
          totalExpense: data.totals.exp,
          percentage : data.percentage
        }
      }
     
      ,

      deleteItem : function( type , id ){
  
        let index ;
        let ids = data.allItems[type].map(function(elements){
             return elements.id;
        }); // [1,3,4,5,6]

          index = ids.indexOf(id); // get the index of 4  which is 2

          if(index !== -1 ) { // mean it exist
            data.allItems[type].splice(index, 1); // (index position , how many elements to delete only 1 element)
          
          }

      }

       , testing : function() { console.log(data); }


  };
})();

//..................................................................
// User Interface Contoller
//..................................................................

let UIController = (function() {
  let DOMStrings = {
    inputbutton: ".add__btn",
    inputType: ".add__type",
    description: ".add__description",
    value: ".add__value",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel : ".budget__value",
    incomeText:".budget__income--value",
    expensesText:".budget__expenses--value",
    expensesPercentage : ".budget__expenses--percentage",
    container : ".container" , 
    expenseesPercLabel : '.item__percentage',
    dateLabel : '.budget__title--month'
  };


  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback(list[i]);
    }
};

var formatNumber = function(num, type) {
  var numSplit, int, dec, type;
  /*
      + or - before number
      exactly 2 decimal points
      comma separating the thousands
      2310.4567 -> + 2,310.46
      2000 -> + 2,000.00
      */

  num = Math.abs(num);
  num = num.toFixed(2);

  numSplit = num.split(".");

  int = numSplit[0];
  if (int.length > 3) {
    int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); //input 23510, output 23,510
  }

  dec = numSplit[1];

  return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
};

  return {
    // get all input values
    getinput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // inc , exp
        description: document.querySelector(DOMStrings.description).value,
        value: parseFloat( document.querySelector(DOMStrings.value).value )
      };
    }
    
    ,


    addListItem: function(obj, type) {
      let html, newhtml, element;

      // create HTML string with place holder
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = `<div class="item" id="inc-%id%">
       <div class="item__description">%description%</div>
       <div class="item__value">+ %value%</div>
       <div class="item__delete"> <button class="item__delete--btn">
       <i class="ion-ios-close-outline"></i></button></div></div>`;
      } else {
        element = DOMStrings.expenseContainer;
        html = `<div class="item" id="exp-%id%">
       <div class="item__description">%description%</div>
       <div class="item__value">- %value%</div>
       <div class="item__percentage">21%</div>
       <div class="item__delete">
       <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div></div>`;
      }

      // Replace the all place holders with actual data
      newhtml = html.replace("%id%", obj.id);
      newhtml = newhtml.replace("%description%", obj.description);
      newhtml = newhtml.replace("%value%", formatNumber(obj.value , type));

      // insert html into the dom
      // beforeend add an html inside container in last or before container end tag
      document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);
    }
    
    ,


    // get inputs class name object
    getDOMStrings: function() {
      return DOMStrings;
    }
    
    ,


    cleanInputs: function() {
      // both clear

      // document.querySelector(DOMStrings.inputType).selectedIndex  = 0;
      // document.querySelector(DOMStrings.description).value = '';
      // document.querySelector(DOMStrings.value).value = '';

      let fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.description + ", " + DOMStrings.value
      );
      console.log(fields); // NodeList(2) [input.add__description, input.add__value]
      fieldsArr = Array.prototype.slice.call(fields); // convert list of field into array
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      document.querySelector(DOMStrings.inputType).selectedIndex = 0;
      fieldsArr[0].focus();
    }

    ,


     displayBudget : function(obj){
      
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

     document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.totalBudget,type);
     document.querySelector(DOMStrings.incomeText).textContent = formatNumber(obj.totalIncome,type);
     document.querySelector(DOMStrings.expensesText).textContent = formatNumber(obj.totalExpense,type);
     if(obj.percentage > 0){
       document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';
     }else{
       document.querySelector(DOMStrings.expensesPercentage).textContent = '---';
     } 
     
    }

    ,

     uiDeleteItem : function(selectedID){
       let el = document.getElementById(selectedID); // income-0
       el.parentNode.removeChild(el) // go up to income__list then back to it's child removechild income-0
    }


    ,


    displayItemsPercentage : function(perc){
  
      let fields = document.querySelectorAll(DOMStrings.expenseesPercLabel);

      let nodeListForEach = function(list,callback){

          for (let i = 0; i < list.length; i++) {
               
            callback(list[i] , i);
                      
           }

      };

      nodeListForEach(fields , function(current , index){
        if(perc[index] > 0 ){
           current.textContent = perc[index] + '%';
        }else{
          current.textContent = '---';
        }
        
      });

    }

    ,

    displayMonth : function(){

      let now , month , year ;

      now = new Date();
      year = now.getFullYear(); 
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
     
          
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

    }

    ,


    changedType: function() {
            
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.description + ',' +
        DOMStrings.value);
      
      nodeListForEach(fields, function(cur) {
         cur.classList.toggle('red-focus'); 
      });
      
      document.querySelector(DOMStrings.inputbutton).classList.toggle('red');

    //   var nodeListForEach = function(list, callback) {
    //     for (var i = 0; i < list.length; i++) {
    //         callback(list[i]);
    //     }
    // };
      
  }


  };
})();

//..................................................................
// Contoller
//..................................................................

let mainController = (function(bc, UI) {


  let setupEventListeners = function() {
    let DOM = UI.getDOMStrings();
    document.querySelector(DOM.inputbutton)
      .addEventListener("click", ControllAdditem);

    document.addEventListener("keypress", e => {
      if (e.keyCode == 13 && e.which === 13) {
        // e.which some browsers use it
        ControllAdditem();
      }
    });

    // add event into parent element which is container
    // it will call when someone click inside this container 
      document.querySelector(DOM.container).addEventListener('click' , DeleteItemControl);

      document.querySelector(DOM.inputType).addEventListener('change', UI.changedType);  

  };



  let updateTheBudget = function(){
       // 1 . caculate the budget
            budgetDataController.calculateBudget();

       // 2 . return the budget 
        let budget = budgetDataController.getDataBudget();
        
      //  3 . display the budget on the ui
        UI.displayBudget(budget);
  };

  
  let updatePercentage = function(){
 
      // 1 .  calculate Percentage
         budgetDataController.calculatePercentages();

      // 2 . Read percentage from the budget controller 
         let percentages = budgetDataController.getPercentages();
          
      // 3 . Update Percentage UI 
        UI.displayItemsPercentage(percentages);
  };

  let ControllAdditem = function() {
    let input, newItem;
    // 1 . Get Input field
    input = UI.getinput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0)
    {

    // 2 . Add the Itemto the budget controller
    newItem = budgetDataController.addItem( input.type, input.description,input.value);
    // 3 . Add item in ui
    UI.addListItem(newItem, input.type);
    // 4 . clean our inputs
    UI.cleanInputs();
    // 5 . calculate and update budget 
    updateTheBudget();

    // 6 . update percentage
    updatePercentage();

    }

    
  };

   // we need  to know event  where is the target element is 
  let DeleteItemControl = function(event){

  
     let itemID , splitID , type , ID;
     itemID = event.target.parentNode.parentNode.parentNode.id; // which is inc-#
     
     if(itemID){
         splitID = itemID.split('-');  // income-2 -> [ 'inc' , '2' ]
         type = splitID[0];
         ID = parseInt(splitID[1]);

         // 1 . delete item from data structure
         budgetDataController.deleteItem(type , ID);
         // 2 . Delete the item from ui 
         UIController.uiDeleteItem(itemID);
         // 3 . Update and show the new budget
         updateTheBudget();

         updatePercentage();
     }

      
  };

  return {
    startApp: function() {
      UI.displayMonth();
      UI.displayBudget(  
        {
        totalBudget : 0 ,
        totalIncome : 0,
        totalExpense: 0,
        percentage : -1
       }
      );
      setupEventListeners();
    }
  };
})(budgetDataController, UIController);

mainController.startApp();
