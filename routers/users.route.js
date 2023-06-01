//const Users = require('../models/user.model')
const {User} = require('../models/user.model')
const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.get(`/`, async (req, res, next)=>{
    const usersList = await User.find()//.select('-passwordHash');
    if(!usersList){
        res.status(500).json({message: 'there is no users in the database'});
    }
    res.send(usersList)
})

router.post(`/`, async (req, res, next)=>{
   let user = await new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    try {

        user = await user.save();
    
        if(!user){
        return res.status(404).send('There is no user in DB');
        }
        res.send(user);
    } catch (error) {
            return res.status(404).send(error); 
    }
    
    })

    router.post('/login', async (req, res, next)=>{
        const user = await User.findOne({email: req.body.email})
        const secret = process.env.secret;
        if(!user){
            return res.status(400).send('The user not found')
        }
        if(user && bcrypt.compareSync(req.body.password, user.passwordHash))
        {
            const token = jwt.sign(
                {userId: user.id,
                isAdmin: user.isAdmin
                },
                secret,
                {expiresIn: '1d'}
            )
            //res.status(200).send('user authenticated')
            res.status(200).send({STATUS:{MSG: 'Authenticated'}, user: user.email, token: token})
        } else{
            return res.status(400).send('Wrong password')
        }
        
    })

    router.get('/:id',  (req, res, next)=>{
        const user =  User.findById(req.params.id)
        .select('-passwordHash')
        .then(user=>{
        if(!user){
            res.status(500).json({message: 'there is no user with this ID'}); 
        } 
        res.status(200).send(user);
        }).catch(err=>{
            return res.status(400).json({success: false, error: err})
        })
    })


    router.get('/get/count', async (req, res, next)=>{
        const usercount = await User.countDocuments()
        if(!usercount){
        res.status(500).json({success: false})
        }
    res.send({TheUserCount: usercount});
    })


    router.delete('/:id', (req, res, next)=>{
        User.findByIdAndRemove(req.params.id).then(user =>{
            if(user){
                return res.status(200).json({success: true, message: 'user deleted'})
            } else {
                return res.status(404).json({success: false, message: 'user not exist'})
            }
        }).catch(err=>{
            return res.status(400).json({success: false, error: err})
        })
        })

module.exports=router;