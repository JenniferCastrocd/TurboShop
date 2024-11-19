
function addToCart(quantityInput, productQuantity,productName) {   
    if (!(quantityInput>=1 && quantityInput<=productQuantity)  ){
      alert("Invalid quantity");
      return
    }
    let currentShoppingCart=localStorage["shoppingCart"];
    
    let newShoppingCart;
  
    if(currentShoppingCart===undefined){
      newShoppingCart=createNewShoppingCartWithProduct(productName,quantityInput);
    }else{
      newShoppingCart=updateCurrentShoppingCart(productName,quantityInput,JSON.parse(currentShoppingCart));
    }
    localStorage["shoppingCart"]=JSON.stringify(newShoppingCart);
    console.log(localStorage["shoppingCart"]);
    alert("Product added");
  
    location.href = "/client.html";   
  
  }
  
  
  function createNewShoppingCartWithProduct(productName,productQuantity){
    let shoppingCart= [createShoppingCartElement(productName,productQuantity)];
    return shoppingCart; 
  }
  
  function updateCurrentShoppingCart(productName,productQuantity,shoppingCart){
    let flag=false;
    let updatedShoppingCart= shoppingCart.map( (element)=>{
      if (element.productName===productName){
        alert("The product was already in your shopping cart. The units were replaced");
        element.productQuantity=productQuantity;
        flag=true;
        return element;
        
      }else{
        return element;
      }
  
    });
    if(!flag){
      updatedShoppingCart= shoppingCart.concat(createShoppingCartElement(productName,productQuantity));
      
    }
    
    return updatedShoppingCart;
  }
  
  
  
  
  function createShoppingCartElement(productName,productQuantity){
    const shoppingCartElement = {
      productName : productName,
      productQuantity : productQuantity
  
    }
    return shoppingCartElement;
  }
  
  var productName= localStorage["productName"] 
  
  document.addEventListener('DOMContentLoaded', function() {
    fetch('client/product?productName='+productName)
      .then(response => response.json())
      .then(data => {
        console.log(data.name);
        console.log(data.price);
        console.log(data.quantity);
        const productImage=document.getElementById('product-image')
        const productDescription=document.getElementById('product-description')
        const productPrice=document.getElementById('product-price')
        const productQuantity=document.getElementById('product-quantity')
        
        const productName=document.getElementById('product-name')
        productDescription.innerHTML=data.description
        
        productPrice.innerHTML=data.price
        productQuantity.innerHTML=data.quantity
        productName.innerHTML=data.name
        
        const quantityInput=document.getElementById('quantity-input')
        quantityInput.max=data.quantity
        
        const shoppingCartButton=document.getElementById('shopping-cart-button')
        shoppingCartButton.onclick = function ( ) {addToCart(quantityInput.value,data.quantity,data.name)}
  
  
      
      })
  
     .catch(error => console.error('Error fetching products:', error));
  });
  