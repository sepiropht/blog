var express = require('express');
var router = express.Router();

var  Article = require('../models/article');

router.get('/', function(req, res, next) {
  Article.getArticles( function(err, articles) {
    if(err) {
      console.log(err);
    }
    res.json(articles);
  });
});

router.get('/:id', function(req, res, next) {
  Article.getArticleById( req.params.id, function(err, article) {
    if(err) {
      console.log(err);
    }
    res.json(article);
  })
});

router.get('/category/:category', function(req, res, next) {
  Article.getArticlesByCategory( req.params.category, function(err, articles) {
    if(err) {
      console.log(err);
    }
    res.json(articles);
  });
});

router.post('/', function(req, res, next) {
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;

  var newArticle = new Article({
    title: title,
    category: category,
    body: body
  });

  Article.create(newArticle, function(err, article) {
    if (err) {
      console.log(err);
    }
    res.location('/articles');
    res.redirect('/articles');
  })
});

router.put('/', function(req, res, next) {
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var id = req.body.id;

  var newArticle = new Article({
    title: title,
    category: category,
    body: body
  });

  Article.updateArticle(id, newArticle, function(err, article) {
    if (err) {
      console.log(err);
    }
    res.location('/articles');
    res.redirect('/articles');
  })
});

router.delete('/:id', function(req, res, next) {

  var id = req.params.id;

  Article.updateArticle(id,  function(err, article) {
    if (err) {
      console.log(err);
    }
    res.location('/articles');
    res.redirect('/articles');
  })
});




module.exports = router;
