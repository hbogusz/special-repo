({
    doInit: function (cmp) {
        cmp.set("v.imgId", "/resource/1656320785000/addImage");
    },
    handleSuccess: function (component, event, helper) {
        var isImgAdded = component.get('v.imgField') ? true : false;
        var payload = event.getParams().response;
        component.set('v.recordId', payload.id);
        var sendIdEvent = $A.get("e.c:ProductCreated");
        sendIdEvent.setParams({
            "productId": payload.id
        });
        sendIdEvent.fire();
    },
    handleCancel: function (component, event, helper) {
        $A.get("e.c:ProductCreated").fire();
    },
    handleError: function (component, event, helper) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Error!",
            "message": event.getParam("message"),
            "type": "error"
        });
        toastEvent.fire();
    },
    manageImg: function (component, event, helper) {
        var modalBody;
        var price = component.find('priceInput');

        if (component.get('v.price') != '' && component.get('v.price') != undefined && component.get('v.name') != '' && component.get('v.name') != undefined) {
            $A.createComponent("c:ImgManager", {},
                function (content, status) {
                    if (status === "SUCCESS") {
                        modalBody = content;
                        var modalPromise = component.find('overlayImg').showCustomModal({
                            header: "Image Manager",
                            body: modalBody,
                            showCloseButton: true
                        });
                        component.set("v.modalPromise", modalPromise);
                    }
                });
        } else {
            $A.util.addClass(price, "slds-has-error");
            component.set("v.priceError", true);
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "message": 'Fields: Name and Price must be filled out!',
                "type": "error"
            });
            toastEvent.fire();
        }
    },
    closeModal: function (component, event, helper) {
        var mainImg = event.getParam('imgId');
        if (mainImg == null) {
            component.set('v.imgId', "/resource/1656320785000/addImage");
        } else {
            component.get('v.modalPromise').then(function (modal) {
                modal.close();
            });
            component.set('v.imgId', '/sfc/servlet.shepherd/document/download/' + mainImg);
        }
        component.set('v.imgField', '/sfc/servlet.shepherd/document/download/' + mainImg);
    },
    handleSaving: function (component, event, helper) {
        var recordId = component.get('v.recordId');
        var price = component.find('priceInput');
        if (component.get('v.price') != '' && component.get('v.price') != undefined && component.get('v.name') != '' && component.get('v.name') != undefined) {
            if (recordId != undefined) {
                component.set("v.spinner", true);
                helper.addPricebookEntry(component);
                var navigation = component.find('navigation');
                setTimeout(() => {
                    component.set("v.spinner", false);
                    navigation.navigate({
                        'type': 'standard__recordPage',
                        'attributes': {
                            'objectApiName': 'Product2',
                            'recordId': component.get('v.recordId'),
                            'actionName': 'view'
                        }
                    });
                }, "1000")
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": 'You should add some image to be able to save product',
                    "type": "error"
                });
                toastEvent.fire();
            }
        } else {
            $A.util.addClass(price, "slds-has-error");
            component.set("v.priceError", true);
            var errorToast = $A.get("e.force:showToast");
            errorToast.setParams({
                "title": "Error!",
                "message": 'Fields: Name and Price must be filled out!',
                "type": "error"
            });
            errorToast.fire();
        }

    },
    handleSavingNew: function (component, event, helper) {
        var price = component.find('priceInput');
        var recordId = component.get('v.recordId');
        if (component.get('v.price') != '' && component.get('v.price') != undefined && component.get('v.name') != '' && component.get('v.name') != undefined) {
            if (recordId != undefined) {
                component.set("v.spinner", true);
                helper.addPricebookEntry(component);
                setTimeout(() => {
                    $A.get('e.force:refreshView').fire();
                }, "1000")
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": 'You should add some image to be able to save product',
                    "type": "error"
                });
                toastEvent.fire();
            }
        } else {
            $A.util.addClass(price, "slds-has-error");
            component.set("v.priceError", true);
            var errorToast = $A.get("e.force:showToast");
            errorToast.setParams({
                "title": "Error!",
                "message": 'Fields: Name and Price must be filled out!',
                "type": "error"
            });
            errorToast.fire();
        }
    },

    onPriceChange: function (component, event, helper) {
        var price = component.find('priceInput');
        $A.util.removeClass(price, "slds-has-error");
        component.set("v.priceError", false);
    },


})