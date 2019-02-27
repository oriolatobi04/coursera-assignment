//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else{
            this.percentage = -1
        }
    };
    
    Expenses.prototype.getPercentage  = function(){
        return this.percentage;
    }
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        for (myValue of data.allItems[type]){
            sum += myValue.value;
        }
//        data.allItems[type].forEach(function(cur){
//            sum += cur.value;
//        });
        data.totals[type] = sum;
    };
    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return{
        addItem:function(type, des, val){
            var newItem, ID;
            
            //Create a new ID
            if (data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //Create a new item based on 'exp' and 'inc'
            if(type === 'exp'){
                newItem = new Expenses(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //Push it into our Data Structure
            data.allItems[type].push(newItem);
            
            //Return the new Element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
               return current.id;
                
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            
            //Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculatethe percentage of income
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
          data.allItems.exp.forEach(function(cur){
              cur.calcPercentage(data.totals.inc);
          });
               
        },
        
        getPercentages: function(){
            var allPerc =  data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        testing: function(){
            console.log(data);
        }
    };
   
})();


//UI CONTROLLER
var UIController = (function(){
    
        var DOMStrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expenseContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expPercLabel: '.item__percentage',
            dateValidation: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        var splitNum = num.split('.');
        var int = splitNum[0];
        if(int.length > 3){
          var int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        };
        var dec = splitNum[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    var nodeListForEach = function(list, callback){
         for ( var i = 0; i < list.length; i++){
             callback(list[i], i);
         }
    };
     return{
        getInput: function(){
            return{
                type:  document.querySelector(DOMStrings.inputType).value,
                description:  document.querySelector(DOMStrings.inputDescription).value,
                value:  parseFloat(document.querySelector(DOMStrings.inputValue).value)

            };
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            //Create HTML strings with placeholder text
            if(type === 'inc'){
               element = DOMStrings.incomeContainer;
               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div></div></div>';   
            }else if (type === 'exp'){
               element = DOMStrings.expenseContainer;
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
         
         deleteListItem: function(selectorId){
             var element = document.getElementById(selectorId);
             element.parentNode.removeChild(element);
         },
         
        clearFields: function(){
            var fields ,fieldArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current, index, value){
                current.value = "";
            });
            fieldArr[0].focus();
        },
         
         displayBudget: function(obj){
             var type;
             obj.budget > 0 ? type === 'inc' : type === 'exp';
             document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
             document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
             
             if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'; 
             }else{
                 document.querySelector(DOMStrings.percentageLabel).textContent = '---';
             }
         },
         
         displayPercentages: function(percentage){
           var fields = document.querySelectorAll(DOMStrings.expPercLabel);
             
             nodeListForEach(fields, function(current, index){
                 if(percentage[index] > 0)
                 current.textContent = percentage[index] + '%';
                 else current.textContent = '---';
             });
             
         },
         
         displayMonth: function(){
             var now = new Date();
             
             var months = ['january', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
             var year = now.getFullYear();
             var month = now.getMonth();
             var date = now.getDate();
             document.querySelector(DOMStrings.dateValidation).textContent = months[month] + ' ' + date + ', ' + year;
         },
         
         changedType: function(){
             var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
             
             nodeListForEach(fields, function(cur){
                 cur.classList.toggle('red-focus');
             });
             document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
         },
        getDOMStrings: function(){
            return DOMStrings;
    }
    };
    
})();


//BUDGET APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
   
        document.addEventListener('keypress', function(event){
        
        if(event.keyCode === 13){
            ctrlAddItem();
       }
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
            
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    });
    };
    
    var updateBudget = function(){
        
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the Budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        
        //1. calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. read the percentage from the income
        var percentage = budgetCtrl.getPercentages();
        //3. update the percentages to the UI
        UICtrl.displayPercentages(percentage);
    };
    
    var ctrlAddItem = function(){
        
        
        //1. Get the field input data
        var input = UICtrl.getInput();
        console.log(input);
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            //2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            var newList = UICtrl.addListItem(newItem, input.type);

            //4. Clear Input Fields
            var inputFields = UICtrl.clearFields();
            
            //5. Call the updated Budget
            updateBudget();
            
            //4. calculate percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event){
            var splitId, type, Id, itemId;
            itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
            
            if(itemId){
                splitId = itemId.split('-');
                type = splitId[0];
                Id = parseInt(splitId[1]);
                
                //1. Delete item from the data structure
                budgetCtrl.deleteItem(type, Id);
                
                //2. Delete the item from the UI
                UICtrl.deleteListItem(itemId);
                
                //3. Update the item and show new budget
                updateBudget();
                
                //4. calculate percentages
                updatePercentages();
            }
        
        
        };
    
        return{
            init: function(){
                UICtrl.displayMonth();
                console.log('Your Application is started');
                UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
                setUpEventListeners();
                
            }
        };
  
    
})(budgetController, UIController);

controller.init();
















