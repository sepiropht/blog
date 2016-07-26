var express = require('express');
var router = express.Router();

var  Category = require('../models/category');
/* GET users listing. */
router.get('/', function(req, res, next) {
  Category.getCategories( function(err, categories) {
    if(err) {
      console.log(err);
    }
    res.json(categories);
  })
});

router.get('/:id', function(req, res, next) {
  Category.getCategoryById( req.params.id, function(err, category) {
    if(err) {
      console.log(err);
    }
    res.json(category);
  })
});

router.post('/', function(req, res, next) {
  var title = req.body.title;
  var description = req.body.description;


  var newCategory = new Category({
    title: title,
    description: description,
  });

  Category.create(newCategory, function(err, category) {
    if (err) {
      console.log(err);
    }
    res.location('/categories');
    res.redirect('/categories');
  })
});

router.put('/', function(req, res, next) {
  var title = req.body.title;
  var description = req.body.description;

  var newCategory = new Category({
    title: title,
    description: description,
  });

  Category.updateCategory(id, data, function(err, article) {
    if (err) {
      console.log(err);
    }
    res.location('/categories');
    res.redirect('/categories');
  })
});

router.delete('/:id', function(req, res, next) {

  var id = req.params.id;

  Category.updateCategory(id,  function(err, category) {
    if (err) {
      console.log(err);
    }
    res.location('/categories');
    res.redirect('/categories');
  })
});



module.exports = router;
