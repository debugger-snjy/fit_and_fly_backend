// This file is used for Operations by Admin

// Importing the express Package
const express = require('express');

// Create a router of the express
const router = express.Router()

// Importing the express-validator
const { body, validationResult } = require('express-validator');

// Getting the Middle ware
const fetchUser = require('../middleware/fetchUserId');

// Module to use the Mailing Services
const nodemailer = require("nodemailer")

// Importing the dotenv for JWT_SECRET_KEY access
const dotenv = require('dotenv');

// Getting the Environment Variables from the env file
dotenv.config();

const { MongoClient } = require('mongodb');
const Items = require('../models/Items');
const Orders = require('../models/Orders');
const DeletedOrders = require('../models/DeletedOrders');
const Carts = require('../models/Cart');
const Wishlists = require("../models/Wishlist");
const Customers = require('../models/Customer');
const Transactions = require('../models/Transaction');

// Function to Send a Mail : 
const sendMailFromAccount = async (userEmail, subjectData, bodyData) => {

    try {

        // Creating the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fitandfly.sanjay@gmail.com',
                pass: process.env.MAIL_PASSKEY,
            },
        });

        await transporter.sendMail({
            from: "fitandfly.sanjay@gmail.com",
            to: userEmail,
            subject: subjectData,
            html: bodyData,
            attachments: [{
                filename: 'Fit&Fly.png',
                path: '../Fit&Fly.png',
                cid: 'fit&flylogo2023' //same cid value as in the html img src
            }]
        });




        // TODO : Make Alert Message of the Transaction

        return true
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
        return 0
    }

}


// =====================================================================================================================================================
// ----- ADD ITEM IN CART ROUTES ---------- ADD ITEM IN CART ROUTES ---------- ADD ITEM IN CART ROUTES ---------- ADD ITEM IN CART ROUTES ---------- ADD
// =====================================================================================================================================================

// For Adding Carts Items - POST Request
// Full Route : /api/customer/add/itemincart
router.post('/add/itemincart', fetchUser, [

    body("itemID", "Your Item ID is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item has NOT Added in Cart Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Not Added in Cart Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { itemID } = req.body;

        const item = await Items.find({ _id: itemID })
        // console.log("Itemmmmm : ", item)

        // Create a new cart document
        const cart = new Carts({
            itemName: item[0].itemName,
            itemDate: item[0].itemDate,
            itemPrice: item[0].itemPrice,
            itemType: item[0].itemType,
            itemCategory: item[0].itemCategory,
            itemImages: item[0].itemImages,
            itemCode: item[0].itemCode,
            user: req.user.id,
            cartItem: item[0]._id,
        });

        // Save the item document to the database
        // If saved successfully
        if (await cart.save()) {

            // Setting up the parameters
            status = "success";
            msg = "Item Record has been Added in Cart Successfully"

            const itemDetails = await Items.find({ _id: itemID });

            // Updating the Item Cart Count in the Item Record :
            const updateItemCartCount = await Items.findByIdAndUpdate(itemID, { $set: { itemCartCount: itemDetails[0].itemCartCount + 1 } }, { new: true });

            if (updateItemCartCount.length) {
                console.log("Item Cart Count Updated Successfully !!")
            }
            else {
                console.log("Item Cart Count Updation Failed !!")
            }

            // Printing all the item 
            console.log(cart)
        }

        return res.json({ status: status, msg: msg, cart: cart });
    }
    catch (error) {
        if (error._message === "cart validation failed") {
            console.error("BSONError encountered:", error.message, error.code);
            console.error("Item with this ID Doesn't Exists !!")
            res.status(500).json({ status: status, msg: "Item with this Item ID Doesn't Exists !" });

        } else {
            // Handle other errors
            console.error('Error:', error.code, " ==> ", error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
})

// For Deleting Item - DEL Request
// Full Route : /api/customer/delete/itemincart/:cartID
router.delete('/delete/itemincart/:cartID', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Found in Cart";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const iteminCart = await Carts.findById(req.params.cartID);

        // If that Item doesn't exists, then returning the Bad Response
        if (!iteminCart) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Found in Cart"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found in Cart !" })
        }

        const deletedItemFromCart = await Carts.findByIdAndDelete(req.params.cartID);

        console.log(deletedItemFromCart)

        // Getting the Item
        const itemDetails = await Items.find({ _id: deletedItemFromCart.cartItem });

        // Updating the Item Cart Count in the Item Record :
        const updateItemCartCount = await Items.findByIdAndUpdate(deletedItemFromCart.cartItem, { $set: { itemCartCount: itemDetails[0].itemCartCount - 1 } }, { new: true });

        if (updateItemCartCount.length) {
            console.log("Item Cart Count Updated Successfully !!")
        }
        else {
            console.log("Item Cart Count Updation Failed !!")
        }

        // Setting up the parameters
        status = "success";
        msg = "Item Record has been Deleted Successfully from Cart"

        return res.json({ status: status, msg: msg, item: deletedItemFromCart });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Item Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Adding Wishlist Items - POST Request
// Full Route : /api/customer/add/iteminwishlist
router.post('/add/iteminwishlist', fetchUser, [

    body("itemID", "Your Item ID is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item has NOT Added in WIshlist Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Not Added in Wishlist Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { itemID } = req.body;

        const item = await Items.find({ _id: itemID })
        // console.log("Itemmmmm : ", item)

        // Create a new wishlist document
        const wishlist = new Wishlists({
            itemName: item[0].itemName,
            itemDate: item[0].itemDate,
            itemPrice: item[0].itemPrice,
            itemType: item[0].itemType,
            itemCategory: item[0].itemCategory,
            itemImages: item[0].itemImages,
            itemCode: item[0].itemCode,
            user: req.user.id,
            wishlistItem: item[0]._id,
        });

        // Save the item document to the database
        // If saved successfully
        if (await wishlist.save()) {

            const itemDetails = await Items.find({ _id: itemID });

            // Updating the Item Cart Count in the Item Record :
            const updateItemWishlistCount = await Items.findByIdAndUpdate(itemID, { $set: { itemWishlistCount: itemDetails[0].itemWishlistCount + 1 } }, { new: true });

            if (updateItemWishlistCount.length) {
                console.log("Item Cart Count Updated Successfully !!")
            }
            else {
                console.log("Item Cart Count Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Item Record has been Added in Wishlist Successfully"

            // Printing all the item 
            console.log(wishlist)
        }

        return res.json({ status: status, msg: msg, wishlist: wishlist });
    }
    catch (error) {
        if (error._message === "wishlist validation failed") {
            console.error("BSONError encountered:", error.message, error.code);
            console.error("Item with this ID Doesn't Exists !!")
            res.status(500).json({ status: status, msg: "Item with this Item ID Doesn't Exists !" });

        } else {
            // Handle other errors
            console.error('Error:', error.code, " ==> ", error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
})

// For Deleting Item - DEL Request
// Full Route : /api/customer/delete/iteminwishlist/:wishlistID
router.delete('/delete/iteminwishlist/:wishlistID', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Found in Wishlist";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const iteminWishlist = await Wishlists.findById(req.params.wishlistID);

        // If that Item doesn't exists, then returning the Bad Response
        if (!iteminWishlist) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Found in Wishlist"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found in Wishlist !" })
        }

        const deletedItemFromWishlist = await Wishlists.findByIdAndDelete(req.params.wishlistID);

        console.log(deletedItemFromWishlist)

        // Getting the Item
        const itemDetails = await Items.find({ _id: deletedItemFromWishlist.wishlistItem });

        // Updating the Item Wishlist Count in the Item Record :
        const updateItemWishlistCount = await Items.findByIdAndUpdate(deletedItemFromWishlist.wishlistItem, { $set: { itemWishlistCount: itemDetails[0].itemWishlistCount - 1 } }, { new: true });

        if (updateItemWishlistCount.length) {
            console.log("Item Wishlist Count Updated Successfully !!")
        }
        else {
            console.log("Item Wishlist Count Updation Failed !!")
        }

        // Setting up the parameters
        status = "success";
        msg = "Item Record has been Deleted Successfully from Wishlist"

        return res.json({ status: status, msg: msg, item: deletedItemFromWishlist });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Item Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// =====================================================================================================================================================
// ----- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ----------
// =====================================================================================================================================================

// For Fetching Carts Items - GET Request
// Full Route : /api/customer/fetch/usercartitems
router.get('/fetch/usercartitems', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Cart Items Records Found !";

    try {

        // Finding all the Items in Cart
        const allCartItems = await Carts.find({ user: req.user.id, itemOrdered: false });

        if (allCartItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Cart Items Record has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allCartItems)
        }

        return res.json({ status: status, msg: msg, cartItems: allCartItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ------
// =======================================================================================================================================================

// For Fetching Orders - GET Request
// Full Route : /api/customer/fetch/userorders
router.get('/fetch/userorders', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Orders Found !";

    try {

        // Finding all the Items in Orders
        const allOrders = await Orders.find({ user: req.user.id });

        if (allOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allOrders)
        }

        return res.json({ status: status, msg: msg, orders: allOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST R
// =======================================================================================================================================================

// For Fetching Wishlist - GET Request
// Full Route : /api/customer/fetch/userwishlists
router.get('/fetch/userwishlists', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Wishlist Found !";

    try {

        console.log("User : ", req.user)

        // Finding all the Items in Cart
        const allWishlist = await Wishlists.find({ user: req.user.id });

        if (allWishlist.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Wishlist has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allWishlist)
        }

        return res.json({ status: status, msg: msg, wishlists: allWishlist });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- I
// =======================================================================================================================================================

// For Fetching Item - GET Request
// Full Route : /api/customer/fetch/item/:id
router.get('/fetch/item/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items Record has NOT Fetched Successfully";

    try {
        // Finding all the Items 
        const item = await Items.find({ _id: req.params.id });

        if (item.length !== 0) {

            const updateItemViews = await Items.findByIdAndUpdate(req.params.id, { $set: { itemViews: item[0].itemViews + 1 } }, { new: true });

            if (updateItemViews.length) {
                console.log("Views Updated Successfully !!")
            }
            else {
                console.log("Views Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)

            // Code to check that we get the date in the normal string format or not ?
            // const datecheck = new Date(item[0].itemDate).toLocaleString()
            // console.log("Date : ",item[0].itemDate)
            // console.log("Date : ",datecheck)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/customer/fetch/item/itemcode/:itemcode
router.get('/fetch/item/itemcode/:itemcode', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Item Code NOT Exists";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCode: req.params.itemcode });

        if (item.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/customer/fetch/item/category/:category
router.get('/fetch/items/category/:category', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Category NOT Found !";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCategory: req.params.category[0].toUpperCase() + req.params.category.slice(1).toLowerCase() });

        if (item.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Items in Category has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, items: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Items - GET Request
// Full Route : /api/customer/fetch/allitem
router.get('/fetch/allitems', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Items Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.items?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("items");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allItems = await cursor.toArray();

        if (allItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Items Record has been Fetched Successfully"

            // Finding all the Items 
            console.log(allItems)
        }

        return res.json({ status: status, msg: msg, items: allItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});


// =======================================================================================================================================================
// ----- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY R
// =======================================================================================================================================================

// For Fetching All Catgories - GET Request
// Full Route : /api/customer/fetch/allcategories
router.get('/fetch/allcategories', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Catgories Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.categories?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("categories");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCatgories = await cursor.toArray();

        if (allCatgories.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Catgories has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(allCatgories)
        }

        return res.json({ status: status, msg: msg, categories: allCatgories });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ORDER & TRANSACTION ROUTES ---------- ORDER & TRANSACTION ROUTES ---------- ORDER & TRANSACTION ROUTES ---------- ORDER & TRANSACTION ROUTES ----
// =======================================================================================================================================================

// For Placing Order - POST Request
// Full Route : /api/customer/add/itemincart
router.post('/order/item/:cartID', fetchUser, [
], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order is Not Placed Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Not Added in Cart Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // Getting all the Things !!
        // TODO : Might be Helpful in the Form in the Front - End to autofill the form !
        const user = req.user.id;
        console.log("user : ", user)
        const userData = await Customers.findById(user)
        const orderFrom = userData.name;
        console.log("orderFrom : ", orderFrom)
        const orderAddress = userData.address;
        console.log("orderAddress : ", orderAddress)
        const itemIdInCart = (await Carts.findById(req.params.cartID)).cartItem;
        console.log("itemIdInCart")
        console.log(itemIdInCart)
        const itemData = await Items.findById(itemIdInCart)
        console.log("itemData")
        console.log(itemData)
        const orderPrice = itemData.itemPrice;
        const orderImage = itemData.itemImages;
        const orderItemName = itemData.itemName;
        console.log("orderPrice : ", orderPrice)

        let dateoforder = new Date();

        const orderID = "ORD-" + userData.totalOrders.toString() + dateoforder.getDate() + dateoforder.getHours() + dateoforder.getMinutes() + user.toString().slice(16) + userData.totalOrders.toString();
        console.log(orderID)

        // Now Updating the total Orders : 
        const updateTotalOrders = await Customers.findByIdAndUpdate(user, { $set: { totalOrders: userData.totalOrders + 1 } }, { new: true });

        if (updateTotalOrders) {
            console.log("Total Orders Updated Successfully !!")
        }
        else {
            console.log("Total Orders Updation Failed !!")
        }

        // Now Updating the Cart
        const updateCart = await Carts.findByIdAndUpdate(req.params.cartID, { $set: { itemOrdered: true } }, { new: true });

        if (updateCart) {
            console.log("Item Ordered Updated Successfully !!")
        }
        else {
            console.log("Item Ordered Updated Failed !!")
        }

        // Adding the record of Transaction !
        const transaction = new Transactions({
            user,
            transactionorderID: orderID,
            transactionFrom: orderFrom,
            transactionPrice: orderPrice,
            transactionId: "T-" + dateoforder.getDate() + dateoforder.getHours() + dateoforder.getMinutes() + user.toString().slice(10),
        })

        if (userData.account_balance >= orderPrice) {
            // Also Reducing the amount balance in the customer account
            // For case of insufficient balance, we will handle it in Front End Only, i.e., we will not allow user to order that item
            // Code to reduce the amount from the user account !
            const updateAccountBalance = await Customers.findByIdAndUpdate(user, { $set: { account_balance: (parseFloat(userData.account_balance) - parseFloat(orderPrice)) } }, { new: true });

            if (updateAccountBalance) {
                // Transaction is Successfully Recorded !!
                if (await transaction.save()) {

                    // Sending the Transaction Mail !!
                    const transactionUserEmail = userData.email;
                    const transactionSubjectData = "Fit&Fly - Transaction : " + transaction.transactionId + " - Details";
                    const transactionBodyData = `
                    <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid black">
                        <center>
                            <img src="cid:fit&flylogo2023" width="50%"><br>
                            <hr color="black" size="3px">
                        </center>
                    
                        <p>Hello ${userData.name} !</p>
                        <p>This Email is to notify that you have recently made a transaction from your account.</p>
                        <p>Transaction Details : </p>
                        <p>
                        <table border="2" width="50%">
                            <tr align="left">
                                <th>Transaction Order ID</th>
                                <td>${transaction.transactionorderID}</td>
                            </tr>
                            <tr align="left">
                                <th>Transaction From</th>
                                <td>${transaction.transactionFrom}</td>
                            </tr>
                            <tr align="left">
                                <th>Transaction Price</th>
                                <td>Rs ${transaction.transactionPrice}</td>
                            </tr>
                            <tr align="left">
                                <th>Transaction Id</th>
                                <td>${transaction.transactionId}</td>
                            </tr>
                            <tr align="left">
                                <th>Transaction Date</th>
                                <td>${transaction.transactionDate.toLocaleString()}</td>
                            </tr>
                            <tr align="left">
                                <th>Your Account Balance</th>
                                <td>${userData.account_balance}</td>
                            </tr>
                    
                        </table>
                        </p>
                        <br><br><br><br>
                        <hr>
                        <p><small>This is a auto-generated message.</small></p>
                    </div>
                    `

                    let transactionmailSent = await sendMailFromAccount(transactionUserEmail, transactionSubjectData, transactionBodyData)
                    console.log("Transaction Mail : ", transactionmailSent)

                    // Create a new order document
                    const order = new Orders({
                        user,
                        orderFrom,
                        orderAddress,
                        orderPrice,
                        orderID,
                        orderImage,
                        orderItemName,
                        orderTransactionID: transaction.transactionId,
                    });

                    if (await order.save()) {

                        // Setting up the parameters
                        status = "success";
                        msg = "Transaction Successfull, Order is Placed Successfully"

                        // Printing order details
                        // console.log(order)

                        // Sending the Order Confirmation Mail !!
                        const orderUserEmail = userData.email;
                        const orderSubjectData = "Fit&Fly - Order : " + orderID + " Confirmed !";
                        const orderBodyData = `
                        <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                            <center>
                                <img src="cid:fit&flylogo2023" width="50%"><br>
                                <hr color="black" size="3px">
                            </center>
                        
                            <p>Hello ${userData.name} !</p>
                            <p>This Email is to notify that your order has been placed from your Account wait until it gets approved.</p>
                            <p>Orders Details : </p>
                            <p>
                            <table border="2" width="50%">
                                <tr align="left">
                                    <th>Order ID</th>
                                    <td>${order.orderID}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order From</th>
                                    <td>${order.orderFrom}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Price</th>
                                    <td>Rs ${order.orderPrice}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Date</th>
                                    <td>${order.orderDate.toLocaleString()}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Status</th>
                                    <td>${order.orderStatus}</td>
                                </tr>
                                <tr align="left">
                                    <th>Your Account Balance</th>
                                    <td>${userData.account_balance}</td>
                                </tr>
                        
                            </table>
                            </p>
                            <br><br><br><br>
                            <hr>
                            <p><small>This is a auto-generated message.</small></p>
                        </div>
                        `

                        let orderMailSent = await sendMailFromAccount(orderUserEmail, orderSubjectData, orderBodyData)
                        console.log("Order Mail : ", orderMailSent)

                        return res.json({ status: status, msg: msg, order: order });

                    }
                }
            }
            else {
                // Setting up the parameters
                status = "failed";
                msg = "Transaction Failed !"

                return res.json({ status: status, msg: msg });

            }
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Transaction Can't be Done due to Insufficient Balance !"

            return res.json({ status: status, msg: msg });

        }

    }
    catch (error) {

        // Handle other errors
        console.error('Error:', error.code, " ==> ", error.message);
        res.status(500).json({ error: 'Internal Server Error !' });

    }
})

// For Cancelling Order - POST Request
// Full Route : /api/customer/cancel/order/:orderID
router.post('/cancel/order/:orderID', fetchUser, [

    body("cancelMsg", "Your Cancel Message is not Available").notEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order is Not Cancelled";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Order is Not Cancelled !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const orderinList = await Orders.find({ orderID: req.params.orderID });
        console.log(orderinList)
        const userData = await Customers.findById(req.user.id)

        // If that Item doesn't exists, then returning the Bad Response
        if (orderinList.length === 0) {

            // Setting up the parameters
            status = "failed";
            msg = "Order Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Order Not Found !" })
        }
        else if (orderinList[0].orderStatus !== "Approved") {
            // Updating the Transaction
            const TransactionRecord = await Transactions.find({ "transactionorderID": req.params.orderID, "user": req.user.id })
            let updateTransactionCancellation;

            if (req.body.cancelMsg) {
                updateTransactionCancellation = await Transactions.findByIdAndUpdate(TransactionRecord[0]._id, { $set: { transactionCancelled: true, transactionCancelMsg: req.body.cancelMsg } }, { new: true });
            }
            else {
                updateTransactionCancellation = await Transactions.findByIdAndUpdate(TransactionRecord[0]._id, { $set: { transactionCancelled: true } }, { new: true });
            }

            // Sending the Transaction Cancelled Mail !
            // Sending the Transaction Mail !!
            const updateTransactionCancellationUserEmail = userData.email;
            const updateTransactionCancellationSubjectData = "Fit&Fly - Cancelled Transaction : " + updateTransactionCancellation.transactionId + " - Details";
            const updateTransactionCancellationBodyData = `
            <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid black">
                <center>
                    <img src="cid:fit&flylogo2023" width="50%"><br>
                    <hr color="black" size="3px">
                </center>
            
                <p>Hello ${userData.name} !</p>
                <p>This Email is to notify that you have recently made a transaction from your account.</p>
                <p>Transaction Details : </p>
                <p>
                <table border="2" width="50%">
                    <tr align="left">
                        <th>Transaction Order ID</th>
                        <td>${updateTransactionCancellation.transactionorderID}</td>
                    </tr>
                    <tr align="left">
                        <th>Transaction From</th>
                        <td>${updateTransactionCancellation.transactionFrom}</td>
                    </tr>
                    <tr align="left">
                        <th>Transaction Price</th>
                        <td>Rs ${updateTransactionCancellation.transactionPrice}</td>
                    </tr>
                    <tr align="left">
                        <th>Transaction Id</th>
                        <td>${updateTransactionCancellation.transactionId}</td>
                    </tr>
                    <tr align="left">
                        <th>Transaction Date</th>
                        <td>${updateTransactionCancellation.transactionDate.toLocaleString()}</td>
                    </tr>
                    <tr align="left">
                        <th>Your Account Balance</th>
                        <td>${userData.account_balance}</td>
                    </tr>
            
                </table>
                </p>
                <br><br><br><br>
                <hr>
                <p><small>This is a auto-generated message.</small></p>
            </div>
            `

            let transactionmailSent = await sendMailFromAccount(updateTransactionCancellationUserEmail, updateTransactionCancellationSubjectData, updateTransactionCancellationBodyData)
            console.log("Transaction Mail : ", transactionmailSent)


            if (updateTransactionCancellation) {

                // Deleting the Order
                // console.log(req.params.orderID)
                // console.log(req.user.id)
                const orderRecord = await Orders.find({ "orderID": req.params.orderID, "user": req.user.id })
                // console.log(orderRecord)

                const deletedOrder = await Orders.findByIdAndDelete(orderRecord[0]._id)
                console.log(deletedOrder)

                if (deletedOrder) {

                    const SavingdeletedOrder = new DeletedOrders({
                        orderID: deletedOrder.orderID,
                        orderFrom: deletedOrder.orderFrom,
                        orderDate: deletedOrder.orderDate,
                        orderStatus: deletedOrder.orderStatus,
                        orderAddress: deletedOrder.orderAddress,
                        orderPrice: deletedOrder.orderPrice,
                        orderApprovedBy: deletedOrder.orderApprovedBy,
                        orderDisapprovedBy: deletedOrder.orderDisapprovedBy,
                        orderApproveDate: deletedOrder.orderApproveDate,
                        orderArrivalTime: deletedOrder.orderArrivalTime,
                        orderApproverName: deletedOrder.orderApproverName,
                        orderDisapproverName: deletedOrder.orderDisapproverName,
                        orderImage: deletedOrder.orderImage,
                        orderItemName: deletedOrder.orderItemName,
                        orderTransactionID: deletedOrder.orderTransactionID,
                    })

                    if (await SavingdeletedOrder.save()) {
                        console.log("Deleted Order Saved !!")
                    }

                    // Returning the amount to the customer account
                    const userData = await Customers.findById(req.user.id)

                    const updateAccountBalance = await Customers.findByIdAndUpdate(req.user.id, { $set: { account_balance: parseFloat(parseFloat(userData.account_balance) + parseFloat(orderRecord[0].orderPrice)) } }, { new: true });

                    if (updateAccountBalance) {
                        console.log("Amount Has been Transfered into your Fit & Fly Account")

                        // Setting up the parameters
                        status = "success";
                        msg = "Order has Successfully Cancelled and Your Amount is credited back to your Fit & Fly Account !"

                        // Sending the Order Cancellation Mail
                        const orderCancellationUserEmail = userData.email;
                        const orderCancellationSubjectData = "Fit&Fly - Cancelled Order : " + deletedOrder.orderID + " Confirmed !";
                        const orderCancellationBodyData = `
                        <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                            <center>
                                <img src="cid:fit&flylogo2023" width="50%"><br>
                                <hr color="black" size="3px">
                            </center>
                        
                            <p>Hello ${userData.name} !</p>
                            <p>This Email is to notify that your order has been placed from your Account wait until it gets approved.</p>
                            <p>Orders Details : </p>
                            <p>
                            <table border="2" width="50%">
                                <tr align="left">
                                    <th>Order ID</th>
                                    <td>${deletedOrder.orderID}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order From</th>
                                    <td>${deletedOrder.orderFrom}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Price</th>
                                    <td>Rs ${deletedOrder.orderPrice}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Date</th>
                                    <td>${deletedOrder.orderDate.toLocaleString()}</td>
                                </tr>
                                <tr align="left">
                                    <th>Order Status</th>
                                    <td>${deletedOrder.orderStatus}</td>
                                </tr>
                                <tr align="left">
                                    <th>Your Account Balance</th>
                                    <td>${userData.account_balance}</td>
                                </tr>
                        
                            </table>
                            </p>
                            <br><br><br><br>
                            <hr>
                            <p><small>This is a auto-generated message.</small></p>
                        </div>
                        `

                        let orderMailSent = await sendMailFromAccount(orderCancellationUserEmail, orderCancellationSubjectData, orderCancellationBodyData)
                        console.log("Order Mail : ", orderMailSent)

                        // Now Updating the total Orders : 
                        const updateTotalOrders = await Customers.findByIdAndUpdate(user, { $set: { totalOrders: userData.totalOrders - 1 } }, { new: true });

                        if (updateTotalOrders) {
                            console.log("Total Orders Updated Successfully !!")
                        }
                        else {
                            console.log("Total Orders Updation Failed !!")
                        }


                        return res.json({ status: status, msg: msg, order: deletedOrder, transaction: updateTransactionCancellation });

                    }
                    else {
                        console.log("Amount Transfer Failed !!")

                        // Setting up the parameters
                        status = "failed";
                        msg = "Order has Successfully Cancelled and Your Amount is NOT credited back to your Fit & Fly Account !"
                    }
                }
                else {
                    // Setting up the parameters
                    status = "failed";
                    msg = "Order Cancellation Failed as No Order Found !"
                }

            }
            else {
                // Setting up the parameters
                status = "success";
                msg = "Order Cancellation Failed As No Transaction Found Regarding this Order"
            }
        }
        else {
            status = "failed";
            msg = "Your Order Cannot Be Cancelled as Your Order is Approved"
        }

        return res.json({ status: status, msg: msg });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Order is Not Cancelled due to some technical Issues ! Please Try Again After Some Time"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// =======================================================================================================================================================
// ----- ACCOUNT BALANCE ROUTES ---------- ACCOUNT BALANCE ROUTES ---------- ACCOUNT BALANCE ROUTES ---------- ACCOUNT BALANCE ROUTES ---------- ACCOUNT B
// =======================================================================================================================================================

// For Adding Item - POST Request
// Full Route : /api/admin/deposit/money
router.post('/deposit/money', [

    body("amount", "Amount Value is Required").exists(),

], fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Account Balance has NOT Updated Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Balance has NOT Updated Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { amount } = req.body;

        // This returns the document after the updates have been applied, reflecting the new state
        const userAccountBalanceUpdate = await Customers.findByIdAndUpdate(
            req.user.id,
            { $inc: { account_balance: parseFloat(amount) } }, // Increment by amount
            { new: true }
        );

        if (userAccountBalanceUpdate) {
            // Setting up the parameters
            status = "success";
            msg = "Your Account Balance has been Credited with ₹" + amount.toString() + " !"

            return res.json({ status: status, msg: msg, account_balance: userAccountBalanceUpdate.account_balance });

        }

        return res.json({ status: status, msg: msg });

    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Item with this Item Code Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Adding Item - POST Request
// Full Route : /api/admin/withdraw/money
router.post('/withdraw/money', [

    body("amount", "Amount Value is Required").exists(),

], fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Account Balance has NOT Updated Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Balance has NOT Updated Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { amount } = req.body;

        // Getting the User Data : 
        const userData = await Customers.findById(req.user.id)

        if (userData.account_balance >= amount) {

            // This returns the document after the updates have been applied, reflecting the new state
            const userAccountBalanceUpdate = await Customers.findByIdAndUpdate(
                req.user.id,
                { $inc: { account_balance: -parseFloat(amount) } }, // Decrement by amount
                { new: true }
            );

            if (userAccountBalanceUpdate) {
                // Setting up the parameters
                status = "success";
                msg = "Your Account Balance has been Debited with ₹" + amount.toString() + " !"

                return res.json({ status: status, msg: msg, account_balance: userAccountBalanceUpdate.account_balance });

            }

            return res.json({ status: status, msg: msg });

        }
        else {

            // Setting up the parameters
            status = "failed";
            msg = "Your Account Balance is Insufficient to withdraw ₹" + amount.toString() + "!"

            return res.json({ status: status, msg: msg, account_balance: userData.account_balance });

        }
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Item with this Item Code Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// =======================================================================================================================================================
// ----- ADDRESS ROUTES ---------- ADDRESS ROUTES ---------- ADDRESS ROUTES ---------- ADDRESS ROUTES ---------- ADDRESS ROUTES ---------- ADDRESS ROUTES 
// =======================================================================================================================================================

router.post('/update/address', [

    body("address", "Your Address is Required").exists(),

], fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Address has NOT Updated Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Address has NOT Updated Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { address } = req.body;

        // Getting the User Data : 
        const userData = await Customers.findById(req.user.id)
        const oldAddress = userData.address;

        console.log("Address Coming : ", address)

        // This returns the document after the updates have been applied, reflecting the new state
        const userAddressUpdate = await Customers.findByIdAndUpdate(
            req.user.id,
            { $set: { address: address } },
            { new: true }
        );

        console.log("Address Updated Record : ", userAddressUpdate)

        if (userAddressUpdate) {
            // Setting up the parameters
            status = "success";
            msg = `Your Address has been Updated !`;

            return res.json({ status: status, msg: msg, address: userAddressUpdate.address });

        }

        return res.json({ status: status, msg: msg });

    }
    catch (error) {

        // Handle other errors
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error !' });

    }
});


module.exports = router;