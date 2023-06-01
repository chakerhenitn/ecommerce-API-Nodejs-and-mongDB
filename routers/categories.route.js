//const category = require('../models/category.model')
const {Category} = require('../models/category.model')
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res, next)=>{
    const categorirsList = await Category.find();
    if(!categorirsList){
        res.status(500).json({message: 'there is no categories in the database'});
    }
    res.status(200).send(categorirsList);
})

router.get('/:id',  (req, res, next)=>{
    const category =  Category.findById(req.params.id).then(category=>{
       if(!category){
        res.status(500).json({message: 'there is no category with this ID'}); 
    } 
    res.status(200).send(category);
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})



router.post(`/`, async (req, res, next)=>{
    let category = await new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();
    
        if(!category){
        return res.status(404).send('There is no category in DB');
        }
        res.send(category);
    })

    router.patch('/:id', (req, res, next)=>{
        const category = Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {new: true}
        )
        .then(category=>{
            if(!category)
                return res.status(500).json({success: false, message: 'category not found'})
            res.status(200).send({message: 'Category updated', category});
        }).catch(err=>{
            return res.status(400).json({success: false, error: err})
        })
    })

router.delete('/:id', (req, res, next)=>{
Category.findByIdAndRemove(req.params.id).then(category =>{
    if(category){
        return res.status(200).json({success: true, message: 'category deleted'})
    } else {
        return res.status(404).json({success: false, message: 'category not exist'})
    }
}).catch(err=>{
    return res.status(400).json({success: false, error: err})
})
})

module.exports=router;