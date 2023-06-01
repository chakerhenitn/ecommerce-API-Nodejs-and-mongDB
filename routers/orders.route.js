const {Order} = require('../models/order.model')
const {OrderItem} = require('../models/orderItem.model')
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res, next)=>{
    const ordersList = await Order.find()
    .populate('user', 'name email')
    .populate('orderItems')
    .populate({
        path: 'orderItems', populate:{
            path: 'product', populate: 'category'} 
        })
    .sort({'dateOrdered': -1});
    if(!ordersList){
        res.status(500).json({success: false});
    }
    res.send(ordersList)
})

router.get(`/:id`, async (req, res, next)=>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems')
    .populate({
        path: 'orderItems', populate:{
            path: 'product', populate: 'category'} });
    if(!order){ 
        res.status(500).json({success: false});
    }
    res.send(order)
})

router.post('/', async(req, res, next)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;

    }))
    //to resolve the promise
    const orderItemsIdsResolved = await orderItemsIds;
    //console.log(orderItemsIdsResolved);

        const totalPrices = await Promise.all(orderItemsIdsResolved.map(async(orderItemId)=>{
         const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
         const totalPrice = orderItem.product.price * orderItem.quantity;
         return totalPrice
        }))
        //console.log(totalPrices);
        const totalPrice = totalPrices.reduce((a,b)=> a +b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();
    if(!order)
    return res.status(400).send('The order can not be passed')
    res.send({message: 'Your order is: ' , order});
})

router.patch('/:id', (req, res, next)=>{
    const order = Order.findByIdAndUpdate(req.params.id, 
        {
        status: req.body.status, 
    },
    {new: true}
    )
    .then(order=>{
        if(!order)
            return res.status(500).json({success: false, message: 'order not found'})
        res.status(200).send({message: 'order status updated', order});
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})


router.delete('/:id', (req, res, next)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order){
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'order deleted'})
        } else {
            return res.status(404).json({success: false, message: 'order not exist'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
    })

    router.get('/get/totalsales', async (req, res, next)=>{
        const totalSales = await Order.aggregate([
            {$group: {_id: null, totalSales: {$sum: '$totalPrice'}}}
        ])
        if(!totalSales){
            return res.status(400).send('The total sales can not displayed')
        }
        res.send({TotalSales: totalSales.pop().totalSales})
    })

    router.get('/get/count', async (req, res, next)=>{
        const ordercount = await Order.countDocuments()

        if(!ordercount){
        res.status(500).json({success: false})
        }
       res.send({TheorderCount: ordercount});
    })

    router.get(`/get/userorders/:userid`, async (req, res, next)=>{
        const userordersList = await Order.find({user: req.params.userid})
        .populate({
            path: 'orderItems', populate:{
                path: 'product', populate: 'category'} 
            })
        .sort({'dateOrdered': -1});
        if(!userordersList){
            res.status(500).json({success: false});
        }
        res.send(userordersList)
    })



module.exports=router;

/**
order example
{
    "orderItems":[
        {
        "quantity":3,
        "product":"6464dd7cd18fd2a13a1907da" 
        },
        {
        "quantity":2,
        "product":"6466165f451c83033d1ab80b"
        }
    ],
    "shippingAddress1":"my new address",
    "shippingAddress2":"my second address",
    "city":"sbz",
    "zip":"216",
    "country":"tunisia",
    "phone":"89998988",
    "totalPrice":"220",
    "user":"6470c4fff80f0e20999d4d8c",
}
 */