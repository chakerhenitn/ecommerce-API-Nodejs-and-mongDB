
const { Category } = require('../models/category.model');
const {Product} = require('../models/prodcut.model')
//const Product = require('../models/prodcut.model')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP ={
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}
//diskstorage
const storage = multer.diskStorage({
    destination: function async (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if(isValid){
        uploadError = null
    }
      cb(uploadError, 'public/uploads')
    },
    filename: function async (req, file, cb) {
      const fileName =  file.originalname.split(' ').join('-');
      //const to store the extension of the file
      const extension =  FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions =  multer({ storage: storage })

router.get(`/`, async (req, res, next)=>{
    const productcount = await Product.countDocuments(mongoose.find);
    let filter = {};
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    } 
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({message: 'there is no products in the database'});
    }
    res.send({prouctDetails:productList, NumberOfProducts:productcount})
})

router.get(`/:id`, async (req, res, next)=>{
    const oneproduct = await Product.findById(req.params.id).populate('category');
    if(!oneproduct){
        res.status(500).json({message: 'there is no products with this iD'});
    }
    res.send(oneproduct)
})

router.post(`/`, uploadOptions.single('image'), async (req, res, next)=>{
    const category = await Category.findById(req.body.category);
    const baseFilePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if(!category)
    return res.status(400).send('Invalid Category ID')
    const file = req.file;
    if(!file)
    return res.status(400).send('There is no file in the request')
    const fileName = req.file.filename
    let product = new Product({
        name: req.body.name,
        description:req.body.description, 
        richDescription:req.body.richDescription,
        image:`${baseFilePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    })
    console.log(uploadOptions);
    product = await product.save();
   
      if(!product)
        return res.status(500).send('Can not create the product')
       res.status(200).send({message: 'product is created', product})
})

router.patch('/:id', async(req, res, next)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product ID')   
    }
   
    const category = Category.findById(req.body.category)
    if(!category)
    return res.status(400).send('Invalid Category ID')

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:req.body.image,    
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    },
    {new: true}
    )
    .then(product=>{
        if(!product)
            return res.status(500).json({success: false, message: 'product not found'})
        res.status(200).send({message: 'product updated', product});
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
  
})


router.delete('/:id', (req, res, next)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({success: true, message: 'product deleted'})
        } else {
            return res.status(404).json({success: false, message: 'product not exist'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
    })

    router.get('/get/count', async (req, res, next)=>{
        const productcount = await Product.countDocuments()

        if(!productcount){
        res.status(500).json({success: false})
        }
       res.send({TheProductCount: productcount});
    })

    router.get('/get/featured/:count', async (req, res, next)=>{
        const count= req.params.count ? req.params.count : 0
        const product = await Product.find({isFeatured: true}).limit(+count);
        if(!product){
        res.status(500).json({success: false})
        }
       res.send({TheFeaturedProduct: product});
    })



router.put('/galleryimages/:id', 
    uploadOptions.array('images', 10), 
    async (req, res, next)=>{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).send('Invalid product ID')   
        }
        const files = req.files;
          let imagesPaths = []; 
          const baseFilePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
          if(files){
            files.map(file =>{
                imagesPaths.push(`${baseFilePath}${file.filename}`);
            })
          }


        const product = await Product.findByIdAndUpdate(req.params.id,
             {
            images: imagesPaths
        },
        {new: true}
        )
       
            if(!product)
                return res.status(500).send('product can not be updated')
            res.send(product);
        })
  

module.exports = router;

