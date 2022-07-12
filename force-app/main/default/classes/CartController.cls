public with sharing class CartController {
    @AuraEnabled(Cacheable=true)
    public static void addProductToCart(Decimal price, String productId, String flavour,Integer quantity){
        CartItem newItem = new CartItem();
        newItem.productId = productId;
        newItem.price = price;
        newItem.flavour = flavour;
        newItem.quantity = quantity;
        Map<String,CartItem> cartItems = new Map<String,CartItem>();
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.cartStorage');
        if((Map<String,CartItem>)sessionPart.get('cart') != null){
            cartItems = (Map<String,CartItem>)sessionPart.get('cart');
        }
        if(cartItems.keySet().contains(newItem.productId)){
            CartItem dupCartItem = cartItems.get(newItem.productId);
           dupCartItem.quantity += newItem.quantity;
           cartItems.put(newItem.productId,dupCartItem);                   
        } else {
            cartItems.put(newItem.productId,newItem);
        }              
        sessionPart.put('cart', cartItems);
    }
    @AuraEnabled(Cacheable=true)
    public static String getItemsFromCart(){
        try {
            Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.cartStorage');
            if((Map<String,CartItem>)sessionPart.get('cart') != null){
                Map<String,CartItem> cartItems = (Map<String,CartItem>)sessionPart.get('cart');
                return JSON.serialize(cartItems.values());
            }
            else {
                return 'error';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void deleteItemFromCart(String productId){
        Map<String,CartItem> cartItems = new Map<String,CartItem>();

        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.cartStorage');
        if((Map<String,CartItem>)sessionPart.get('cart') != null)
        cartItems = (Map<String,CartItem>)sessionPart.get('cart');
        if(cartItems.keySet().contains(productId)){
            cartItems.remove(productId);              
         }
        sessionPart.put('cart', cartItems);
    }
    @AuraEnabled
    public static void changeQuantity(String productId, Integer quantity){
        Map<String,CartItem> cartItems = new Map<String,CartItem>();
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.cartStorage');
        if((Map<String,CartItem>)sessionPart.get('cart') != null)
        cartItems = (Map<String,CartItem>)sessionPart.get('cart');
        if(cartItems.keySet().contains(productId)){
            CartItem dupCartItem = cartItems.get(productId);
            dupCartItem.quantity = quantity;   
            cartItems.put(productId,dupCartItem);
         }
        sessionPart.put('cart', cartItems);
    }
    @AuraEnabled
    public static void clearCart(){
        Map<String,CartItem> cartItems = new Map<String,CartItem>();
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.cartStorage');
        if((Map<String,CartItem>)sessionPart.get('cart') != null)
        cartItems = (Map<String,CartItem>)sessionPart.get('cart');
        cartItems.clear();
        sessionPart.put('cart', cartItems);
    }
    @AuraEnabled
    public static void createOrder(){
        try {
            Id pbId = [SELECT Id FROM Pricebook2 WHERE IsActive = TRUE LIMIT 1].Id;
            Order order = new Order();
            Date currentDate = Date.today();

            order.AccountId = [SELECT Id FROM Account WHERE Name = 'DHL' LIMIT 1].Id;
            order.Pricebook2Id = pbId;
            order.OwnerId = UserInfo.getUserId();
            order.Status = 'Draft';
            order.EffectiveDate = currentDate;

            insert order;
            
            List<OrderItem> orderItems = new List<OrderItem>();
            List<CartItem> cartItems= new List<CartItem>();
            cartItems = (List<CartItem>) JSON.deserialize(getItemsFromCart(), List<CartItem>.class);

            for(CartItem cartItem : cartItems){
                OrderItem orderItem = new OrderItem();
                orderItem.OrderId = order.Id;
                orderItem.PricebookEntryId =  [SELECT Id FROM PricebookEntry WHERE Product2Id = :cartItem.productId AND Pricebook2Id = :pbId LIMIT 1].Id;
                orderItem.Quantity = cartItem.quantity;
                orderItem.UnitPrice = cartItem.price;
                orderItems.add(orderItem);
            }

            insert orderItems;
            

        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class CartItem{
        String flavour;
        Decimal price;
        String productId;
        Integer quantity;
    }
}