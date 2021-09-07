// BUDGET CONTROLLER
var budgetController = (function () {
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // create Expense object {id:1 , description:"Car" , value:1000 , percentage:"43"}
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // calculate each item percentage
  Expense.prototype.calcItemPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getItemPercentage = function () {
    return this.percentage;
  };

  //   var calculateTotal = function(type) {
  //       var sum = 0;
  //       data.allItems[type].forEach(function(cur) { // forEach or map
  //           sum += cur.value;
  //       });
  //       data.totals[type] = sum;
  //   };

  return {
    calculateTotal: function (type) {
      var sum = 0;
      data.allItems[type].forEach(function (cur) {
        // forEach or map
        sum += cur.value;
      });
      data.totals[type] = sum;
    },

    addItem: function (type, des, val) {
      var newItem, ID;

      //[1 2 3 4 5], next ID = 6
      //[1 2 4 6 8], next ID = 9
      // ID = last ID + 1

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 1;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      // id = 6
      //data.allItems[type][id];
      // ids = [1 2 4  8]
      //index = 3

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudgetAndExpensePercentage: function () {
      // calculate total income and expenses
      this.calculateTotal("exp");
      this.calculateTotal("inc");

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data["totals"].exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
    },

    // calculate percentages on each exp item
    calculateEachExpPercentage: function () {
      /*
          a=20
          b=10
          c=40
          income = 100
          a=20/100=20%
          b=10/100=10%
          c=40/100=40%
          */

      data.allItems.exp.forEach(function (cur) {
        cur.calcItemPercentage(data.totals.inc);
      });
    },

    getEachExpPercentage: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getItemPercentage(); // array list of percentage
      });
      return allPerc;
    },

    getData: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      let input1 = new Expense(1, "Salary", 5000, -1);

      input1.calcItemPercentage(9000);
      console.log(input1.getItemPercentage()); // 56%
      console.log(input1); // Expense {id: 1, description: "Salary", value: 5000, percentage: 56}

      // console.log(data);
    },
  };
})();

// UI CONTROLLER #########################################################
var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type;
    /*
          + or - before number
          exactly 2 decimal points
          comma separating the thousands
          2310.4567 -> + 2,310.46
          2000 -> + 2,000.00
          */

    num = Math.abs(num); // give positive -3 -> 3
    num = num.toFixed(2); // add two 0 --> 3 -> 3.00  or 389 -> 389.00

    numSplit = num.split("."); // (2) ["3", "00"]

    int = numSplit[0]; // "3"
    if (int.length > 3) {
      // init = 4599  (length 4)  --> sub(0,1) --> 4  --> 4,599
      // init = 12998 (length 5)  --> sub(0,2) --> 12 --> 12,998
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); //input 23510, output 23,510
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer; // .income__list

        html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>
              <div class="right clearfix"><div class="item__value">%value%</div>
              <div class="item__delete">
              <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer; // .expenses__list

        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
              <div class="right clearfix"><div class="item__value">%value%</div>
              <div class="item__percentage">21%</div><div class="item__delete">
              <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      // beforeend add an html inside container in last or before container end tag
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      // document.querySelector(DOMStrings.inputType).selectedIndex  = 0;
      // document.querySelector(DOMStrings.description).value = '';
      // document.querySelector(DOMStrings.value).value = '';
      // document.querySelector(DOMStrings.description).focus();

      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      // [12,32,22,33]

      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // all items percentage

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    //   var nodeListForEach = function(list, callback) {
    //     for (var i = 0; i < list.length; i++) {
    //         callback(list[i], i);
    //     }
    // };
    displayMonth: function () {
      var now, months, month, year;

      now = new Date();
      //var christmas = new Date(2016, 11, 25);

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudgetAndExpensePercentage();

    // 2. Return the budget
    var budget = budgetCtrl.getData();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculateEachExpPercentage();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getEachExpPercentage();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
