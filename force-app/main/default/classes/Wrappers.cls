public with sharing class Wrappers {
    public Wrappers() {

    }
    public class ProductWrapper{
        @AuraEnabled
        public String id;
        @AuraEnabled
        public String productCode;
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String family;
        @AuraEnabled
        public String description;
        @AuraEnabled
        public String image;
    }
    public class PricebookEntryWrapper{
        @AuraEnabled
        public String productId;
        @AuraEnabled
        public String productName;
        @AuraEnabled
        public String family;
        @AuraEnabled
        public String image;
        @AuraEnabled
        public Decimal reviewCount;
        @AuraEnabled
        public Decimal reviewAverage;
        @AuraEnabled
        public Decimal unitPrice;
    }
    
}